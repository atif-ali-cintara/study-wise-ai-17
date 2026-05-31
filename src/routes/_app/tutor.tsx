import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/tutor")({ component: Tutor });

type Msg = { role: "user" | "assistant"; content: string };

function Tutor() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your AI tutor. Ask me anything about your uploaded material — I'll cite sources when possible." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput(""); setLoading(true);

    // Pull recent document text for context
    const { data: docs } = await supabase.from("documents").select("title,text_content").eq("status", "ready").not("text_content", "is", null).limit(3);
    const context = (docs ?? []).map((d) => `## ${d.title}\n${(d.text_content ?? "").slice(0, 4000)}`).join("\n\n");

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: `You are StudyOS Tutor. Use the user's uploaded materials below as primary source. Cite document title when you reference it. If insufficient context, say so.\n\nMATERIALS:\n${context || "(none yet)"}` },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMsg.content },
          ],
        }),
      });
      if (!res.ok) { toast.error("Tutor unavailable. Check Lovable AI credits."); setLoading(false); return; }
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? "(no response)";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h1 className="font-display text-2xl font-bold">AI Tutor</h1>
        <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" />Grounded in your uploads</Badge>
      </div>
      <Card className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <p className="whitespace-pre-wrap text-sm">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-muted-foreground">Thinking…</div>}
          <div ref={endRef} />
        </div>
      </Card>
      <div className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask anything about your material…" />
        <Button onClick={send} disabled={loading}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
