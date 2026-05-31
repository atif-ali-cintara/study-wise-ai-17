import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Check, X, ChevronRight, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/quizzes/$quizId")({ component: TakeQuiz });

function TakeQuiz() {
  const { quizId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [startedAt] = useState(Date.now());

  const { data: quiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async () => (await supabase.from("quizzes").select("*").eq("id", quizId).single()).data,
  });
  const { data: questions } = useQuery({
    queryKey: ["quiz-q", quizId],
    queryFn: async () => (await supabase.from("quiz_questions").select("*").eq("quiz_id", quizId).order("position")).data ?? [],
  });

  const current = questions?.[idx];
  const total = questions?.length ?? 0;
  const result = useMemo(() => {
    if (!submitted || !questions) return null;
    let correct = 0;
    questions.forEach((q: any) => { if (answers[q.id] === q.correct_answer) correct++; });
    return { correct, total };
  }, [submitted, questions, answers, total]);

  const pick = (val: string) => setAnswers((a) => ({ ...a, [current!.id]: val }));

  const submit = async () => {
    if (!questions || !user) return;
    let score = 0;
    const attempts: any[] = [];
    const { data: attempt } = await supabase.from("quiz_attempts").insert({
      quiz_id: quizId, user_id: user.id, total: questions.length, started_at: new Date(startedAt).toISOString(),
    }).select("id").single();
    questions.forEach((q: any) => {
      const ok = answers[q.id] === q.correct_answer;
      if (ok) score++;
      attempts.push({ user_id: user.id, attempt_id: attempt?.id, question_id: q.id, answer: answers[q.id] ?? "", is_correct: ok, time_spent_seconds: 0 });
    });
    const accuracy = questions.length ? score / questions.length : 0;
    const timeSpent = Math.round((Date.now() - startedAt) / 1000);
    if (attempt) {
      await supabase.from("quiz_attempts").update({ score, accuracy, completed_at: new Date().toISOString(), time_spent_seconds: timeSpent }).eq("id", attempt.id);
      await supabase.from("question_attempts").insert(attempts);
    }
    setSubmitted(true);
    toast.success(`Scored ${score}/${questions.length}`);
  };

  if (!quiz || !questions) return <div className="p-6 text-muted-foreground">Loading…</div>;

  if (submitted && result) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Card className="p-8 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gold" />
          <h2 className="mt-3 font-display text-3xl font-bold">{Math.round((result.correct / result.total) * 100)}%</h2>
          <p className="text-muted-foreground">{result.correct} of {result.total} correct</p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" onClick={() => nav({ to: "/quizzes" })}>Back to quizzes</Button>
            <Button onClick={() => { setSubmitted(false); setAnswers({}); setIdx(0); }}>Retake</Button>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 font-display font-semibold">Review</h3>
          {questions.map((q: any, i: number) => {
            const ok = answers[q.id] === q.correct_answer;
            return (
              <div key={q.id} className="border-b py-3 last:border-0">
                <div className="flex items-start gap-2">
                  {ok ? <Check className="mt-0.5 h-4 w-4 text-emerald-500" /> : <X className="mt-0.5 h-4 w-4 text-destructive" />}
                  <div className="flex-1">
                    <p className="font-medium">{i + 1}. {q.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Your answer: <span className={ok ? "text-emerald-600" : "text-destructive"}>{answers[q.id] || "—"}</span></p>
                    {!ok && <p className="text-sm text-muted-foreground">Correct: <span className="text-emerald-600">{q.correct_answer}</span></p>}
                    {q.explanation && <p className="mt-1 text-xs text-muted-foreground italic">{q.explanation}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    );
  }

  if (!current) return <div className="p-6">No questions.</div>;
  const opts = (current.options as string[]) ?? [];
  const selected = answers[current.id];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">{quiz.title}</h1>
        <Badge variant="secondary">{idx + 1} / {total}</Badge>
      </div>
      <Progress value={((idx + 1) / total) * 100} />
      <Card className="p-6">
        <p className="mb-4 font-medium">{current.question}</p>
        <div className="space-y-2">
          {opts.map((o) => (
            <button
              key={o}
              onClick={() => pick(o)}
              className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${selected === o ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
            >
              {o}
            </button>
          ))}
        </div>
      </Card>
      <div className="flex justify-between">
        <Button variant="ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>Previous</Button>
        {idx < total - 1 ? (
          <Button onClick={() => setIdx(idx + 1)} disabled={!selected}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
        ) : (
          <Button onClick={submit} disabled={Object.keys(answers).length < total}>Submit</Button>
        )}
      </div>
    </div>
  );
}
