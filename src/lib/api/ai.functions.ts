import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import process from "node:process";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callAI(body: any) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const r = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, ...body }),
  });
  if (!r.ok) {
    const t = await r.text();
    if (r.status === 429) throw new Error("AI rate limit. Try again shortly.");
    if (r.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace.");
    throw new Error(`AI error ${r.status}: ${t.slice(0, 200)}`);
  }
  return r.json();
}

// ---------- AI Tutor ----------
export const chatTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1),
    documentIds: z.array(z.string().uuid()).optional(),
  }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase.from("documents").select("title,text_content").eq("status", "ready").not("text_content", "is", null).limit(4);
    if (data.documentIds?.length) q = q.in("id", data.documentIds);
    const { data: docs } = await q;
    const ctx = (docs ?? []).map((d) => `## ${d.title}\n${(d.text_content ?? "").slice(0, 3500)}`).join("\n\n");
    const json = await callAI({
      messages: [
        { role: "system", content: `You are StudyOS Tutor — a patient, Socratic study coach. Use the user's uploaded materials below as the primary source. When you reference material, cite the document title in **bold**. If the materials don't cover the question, say so and answer from general knowledge with a clear caveat.\n\nMATERIALS:\n${ctx || "(no materials uploaded yet)"}` },
        ...data.messages,
      ],
    });
    return { reply: json.choices?.[0]?.message?.content ?? "(empty)" };
  });

// ---------- Document processing ----------
export const processDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ documentId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: doc } = await supabase.from("documents").select("*").eq("id", data.documentId).single();
    if (!doc) throw new Error("Document not found");
    // Extract text from uploaded file if not already present
    let textContent = doc.text_content ?? "";
    if ((!textContent || textContent.length < 50) && doc.file_path) {
      await supabase.from("documents").update({ status: "processing", processing_progress: 10, error_message: null }).eq("id", doc.id);
      try {
        const { data: blob, error: dlErr } = await supabase.storage.from("study-materials").download(doc.file_path);
        if (dlErr || !blob) throw new Error(dlErr?.message ?? "Download failed");
        const buf = new Uint8Array(await blob.arrayBuffer());
        const ext = (doc.file_type ?? doc.file_path.split(".").pop() ?? "").toLowerCase();
        if (ext === "pdf") {
          const { extractText, getDocumentProxy } = await import("unpdf");
          const pdf = await getDocumentProxy(buf);
          const r = await extractText(pdf, { mergePages: true });
          textContent = Array.isArray(r.text) ? r.text.join("\n\n") : String(r.text);
        } else if (ext === "docx") {
          const mammoth: any = await import("mammoth");
          const r = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
          textContent = r.value;
        } else if (ext === "txt" || ext === "md") {
          textContent = new TextDecoder().decode(buf);
        } else {
          throw new Error(`Unsupported file type: ${ext.toUpperCase()}. Use PDF, DOCX, or TXT — or paste the text directly.`);
        }
        textContent = (textContent ?? "").trim();
        if (textContent.length < 50) throw new Error("Could not extract readable text from this file.");
        await supabase.from("documents").update({ text_content: textContent, page_count: Math.max(1, Math.ceil(textContent.length / 2000)) }).eq("id", doc.id);
      } catch (e: any) {
        await supabase.from("documents").update({ status: "failed", error_message: (e?.message ?? "Extraction failed").slice(0, 500) }).eq("id", doc.id);
        throw e;
      }
    }
    if (!textContent || textContent.length < 50) {
      await supabase.from("documents").update({ status: "failed", error_message: "No extractable text" }).eq("id", doc.id);
      throw new Error("No text content to process");
    }
    await supabase.from("documents").update({ status: "processing", processing_progress: 30 }).eq("id", doc.id);

    const text = textContent.slice(0, 12000);
    const json = await callAI({
      messages: [
        { role: "system", content: "You extract study structure from documents. Respond ONLY with valid JSON matching the schema. No prose, no markdown fences." },
        { role: "user", content: `Analyze this document titled "${doc.title}" and produce:\n- 3-6 topics (short names)\n- a concise summary (markdown, 200-400 words)\n- 8-12 flashcards (Q&A)\n\nSchema:\n{"topics":[{"name":string,"summary":string}],"summary":string,"flashcards":[{"front":string,"back":string}]}\n\nDOCUMENT:\n${text}` },
      ],
      response_format: { type: "json_object" },
    });
    let parsed: any;
    try { parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}"); }
    catch { throw new Error("AI returned invalid JSON"); }

    await supabase.from("documents").update({ processing_progress: 60 }).eq("id", doc.id);

    // Insert topics
    const topicRows = (parsed.topics ?? []).map((t: any) => ({
      user_id: userId, course_id: doc.course_id, document_id: doc.id, name: String(t.name).slice(0, 200), summary: String(t.summary ?? "").slice(0, 2000),
    }));
    let topicIds: string[] = [];
    if (topicRows.length) {
      const { data: ins } = await supabase.from("topics").insert(topicRows).select("id");
      topicIds = (ins ?? []).map((r) => r.id);
    }

    // Summary
    if (parsed.summary) {
      await supabase.from("summaries").insert({
        user_id: userId, document_id: doc.id, type: "quick", content: String(parsed.summary).slice(0, 8000),
      });
    }

    // Flashcards
    const cardRows = (parsed.flashcards ?? []).slice(0, 20).map((c: any, i: number) => ({
      user_id: userId, course_id: doc.course_id, document_id: doc.id,
      topic_id: topicIds[i % Math.max(topicIds.length, 1)] ?? null,
      type: "qa", front: String(c.front).slice(0, 500), back: String(c.back).slice(0, 1000),
    }));
    if (cardRows.length) await supabase.from("flashcards").insert(cardRows);

    await supabase.from("documents").update({ status: "ready", processing_progress: 100, processed_at: new Date().toISOString() }).eq("id", doc.id);
    return { ok: true, topics: topicIds.length, cards: cardRows.length };
  });

// ---------- Quiz generation ----------
export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    documentId: z.string().uuid().optional(),
    topicId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    size: z.number().min(3).max(20).default(8),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
    title: z.string().min(1).max(120),
  }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let text = "";
    let courseId = data.courseId ?? null;
    if (data.documentId) {
      const { data: d } = await supabase.from("documents").select("text_content,course_id,title").eq("id", data.documentId).single();
      text = (d?.text_content ?? "").slice(0, 10000);
      courseId = courseId ?? d?.course_id ?? null;
    } else if (data.topicId) {
      const { data: t } = await supabase.from("topics").select("summary,name,course_id").eq("id", data.topicId).single();
      text = `# ${t?.name}\n${t?.summary ?? ""}`;
      courseId = courseId ?? t?.course_id ?? null;
    }
    if (!text || text.length < 40) throw new Error("Not enough source material for a quiz");

    const json = await callAI({
      messages: [
        { role: "system", content: "You generate exam questions. Return ONLY valid JSON. No prose, no fences." },
        { role: "user", content: `Create ${data.size} ${data.difficulty} multiple-choice questions from the material below. Each must have 4 options and one correct answer. Provide a brief explanation.\n\nSchema:\n{"questions":[{"question":string,"options":[string,string,string,string],"correct_answer":string,"explanation":string}]}\n\nMATERIAL:\n${text}` },
      ],
      response_format: { type: "json_object" },
    });
    let parsed: any;
    try { parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}"); }
    catch { throw new Error("AI returned invalid JSON"); }

    const { data: quiz, error } = await supabase.from("quizzes").insert({
      user_id: userId, course_id: courseId, document_id: data.documentId ?? null, topic_id: data.topicId ?? null,
      title: data.title, size: data.size, difficulty: data.difficulty, mode: "practice",
    }).select("id").single();
    if (error || !quiz) throw new Error(error?.message ?? "quiz insert failed");

    const qRows = (parsed.questions ?? []).slice(0, data.size).map((q: any, i: number) => ({
      user_id: userId, quiz_id: quiz.id, topic_id: data.topicId ?? null, position: i, type: "mcq",
      question: String(q.question).slice(0, 1000),
      options: q.options, correct_answer: String(q.correct_answer).slice(0, 500),
      explanation: String(q.explanation ?? "").slice(0, 1000),
    }));
    if (qRows.length) await supabase.from("quiz_questions").insert(qRows);

    return { quizId: quiz.id, count: qRows.length };
  });
