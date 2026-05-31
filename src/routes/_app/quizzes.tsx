import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { generateQuiz } from "@/lib/api/ai.functions";
import { Plus, Sparkles, FileQuestion, Play } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/quizzes")({ component: QuizList });

function QuizList() {
  const { user } = useAuth();
  const uid = user?.id;
  const qc = useQueryClient();
  const gen = useServerFn(generateQuiz);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [docId, setDocId] = useState("");
  const [size, setSize] = useState("8");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const { data: quizzes } = useQuery({
    queryKey: ["quizzes", uid],
    queryFn: async () => (await supabase.from("quizzes").select("id,title,size,difficulty,created_at,quiz_attempts(score,total)").order("created_at", { ascending: false })).data ?? [],
    enabled: !!uid,
  });
  const { data: docs } = useQuery({
    queryKey: ["docs-ready", uid],
    queryFn: async () => (await supabase.from("documents").select("id,title").eq("status", "ready")).data ?? [],
    enabled: !!uid,
  });

  const create = async () => {
    if (!title || !docId) return toast.error("Title and document required");
    setBusy(true);
    try {
      await gen({ data: { title, documentId: docId, size: parseInt(size), difficulty } });
      toast.success("Quiz generated");
      setOpen(false); setTitle(""); setDocId("");
      qc.invalidateQueries({ queryKey: ["quizzes"] });
    } catch (e: any) { toast.error(e.message); }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">AI-generated quizzes from your study material.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" />New quiz</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate Quiz</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
              <div><Label>Source document</Label>
                <Select value={docId} onValueChange={setDocId}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{docs?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Questions</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{[5, 8, 10, 15, 20].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={create} disabled={busy} className="w-full"><Sparkles className="mr-1 h-4 w-4" />{busy ? "Generating…" : "Generate"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {quizzes?.length ? quizzes.map((q: any) => {
          const best = q.quiz_attempts?.reduce((acc: number, a: any) => Math.max(acc, a.total ? a.score / a.total : 0), 0) ?? 0;
          return (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2"><FileQuestion className="h-4 w-4 text-primary" /><h3 className="font-display font-semibold">{q.title}</h3></div>
                  <p className="mt-1 text-xs text-muted-foreground">{q.size} questions · {q.difficulty}</p>
                </div>
                <Badge variant="outline">{best > 0 ? `Best: ${Math.round(best * 100)}%` : "Not taken"}</Badge>
              </div>
              <Link to="/quizzes/$quizId" params={{ quizId: q.id }}>
                <Button size="sm" className="mt-3 w-full"><Play className="mr-1 h-3 w-3" />Take quiz</Button>
              </Link>
            </Card>
          );
        }) : <Card className="col-span-2 p-8 text-center text-muted-foreground">No quizzes yet. Generate one from a processed document.</Card>}
      </div>
    </div>
  );
}
