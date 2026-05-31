import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { processDocument } from "@/lib/api/ai.functions";
import { Upload as UploadIcon, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/upload")({ component: UploadCenter });

const MAX_BYTES = 100 * 1024 * 1024;

function UploadCenter() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;
  const [courseId, setCourseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const { data: courses } = useQuery({
    queryKey: ["courses-all", uid],
    queryFn: async () => (await supabase.from("courses").select("id,name,subjects(name)")).data ?? [],
    enabled: !!uid,
  });
  const { data: docs } = useQuery({
    queryKey: ["recent-docs", uid],
    queryFn: async () => (await supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(10)).data ?? [],
    enabled: !!uid,
  });

  const upload = async (files: FileList | null) => {
    if (!files?.length || !uid || !courseId) return toast.error("Pick a course and a file");
    setBusy(true);
    for (const f of Array.from(files)) {
      if (f.size > MAX_BYTES) { toast.error(`${f.name} exceeds 100MB`); continue; }
      const path = `${uid}/${Date.now()}-${f.name}`;
      const { error: upErr } = await supabase.storage.from("study-materials").upload(path, f);
      if (upErr) { toast.error(upErr.message); continue; }
      const { error: insErr } = await supabase.from("documents").insert({
        user_id: uid, course_id: courseId, title: f.name, file_path: path,
        file_type: f.name.split(".").pop()?.toUpperCase(), file_size: f.size, status: "processing",
      });
      if (insErr) toast.error(insErr.message);
    }
    setBusy(false); qc.invalidateQueries(); toast.success("Upload queued");
  };

  const process = useServerFn(processDocument);

  const submitText = async () => {
    if (!text.trim() || !title.trim() || !uid || !courseId) return toast.error("Title, text & course required");
    setBusy(true);
    const { data: ins, error } = await supabase.from("documents").insert({
      user_id: uid, course_id: courseId, title, file_type: "TXT",
      text_content: text, status: "processing", page_count: Math.ceil(text.length / 2000),
    }).select("id").single();
    if (error || !ins) { setBusy(false); return toast.error(error?.message ?? "Insert failed"); }
    toast.message("Analyzing with AI…");
    try {
      await process({ data: { documentId: ins.id } });
      toast.success("Document processed — topics, summary & flashcards ready");
    } catch (e: any) {
      toast.error(e.message ?? "Processing failed");
    }
    setBusy(false); setText(""); setTitle(""); qc.invalidateQueries();
  };

  const runProcess = async (docId: string) => {
    try { await process({ data: { documentId: docId } }); toast.success("Processed"); qc.invalidateQueries(); }
    catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Upload Center</h1>
        <p className="text-muted-foreground">Drop PDFs, slides, or paste text. Limit: 100 MB / 500 pages.</p>
      </div>

      <Card className="p-6">
        <Label>Course</Label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select course" /></SelectTrigger>
          <SelectContent>{courses?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.subjects?.name} / {c.name}</SelectItem>)}</SelectContent>
        </Select>

        <Tabs defaultValue="file" className="mt-6">
          <TabsList><TabsTrigger value="file">File upload</TabsTrigger><TabsTrigger value="text">Paste text</TabsTrigger></TabsList>
          <TabsContent value="file">
            <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors hover:bg-accent">
              <UploadIcon className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 font-medium">Click or drag files here</p>
              <p className="text-xs text-muted-foreground">PDF, PPTX, DOCX, TXT</p>
              <input type="file" multiple accept=".pdf,.pptx,.docx,.txt" className="hidden"
                onChange={(e) => upload(e.target.files)} disabled={busy} />
            </label>
          </TabsContent>
          <TabsContent value="text" className="space-y-3 pt-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Paste study content…" rows={10} value={text} onChange={(e) => setText(e.target.value)} />
            <Button onClick={submitText} disabled={busy}>Save</Button>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 font-display text-lg font-semibold">Recent uploads</h2>
        {docs?.length ? docs.map((d: any) => (
          <div key={d.id} className="flex items-center justify-between border-b py-2 last:border-0">
            <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-primary" /><span>{d.title}</span></div>
            <Badge variant={d.status === "ready" ? "default" : d.status === "failed" ? "destructive" : "secondary"}>{d.status}</Badge>
          </div>
        )) : <p className="text-sm text-muted-foreground">No uploads yet.</p>}
      </Card>
    </div>
  );
}
