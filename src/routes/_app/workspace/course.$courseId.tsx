import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Brain, MessageSquare, Sparkles, Upload } from "lucide-react";

export const Route = createFileRoute("/_app/workspace/course/$courseId")({ component: CourseView });

function CourseView() {
  const { courseId } = Route.useParams();
  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => (await supabase.from("courses").select("*, subjects(name)").eq("id", courseId).single()).data,
  });
  const { data: docs } = useQuery({
    queryKey: ["docs", courseId],
    queryFn: async () => (await supabase.from("documents").select("*").eq("course_id", courseId).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: topics } = useQuery({
    queryKey: ["topics", courseId],
    queryFn: async () => (await supabase.from("topics").select("*, mastery_scores(score, level)").eq("course_id", courseId)).data ?? [],
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{course?.subjects?.name}</p>
        <h1 className="font-display text-3xl font-bold">{course?.name ?? "Course"}</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to="/upload"><Button className="gap-2"><Upload className="h-4 w-4" />Upload material</Button></Link>
        <Link to="/flashcards"><Button variant="outline" className="gap-2"><Brain className="h-4 w-4" />Flashcards</Button></Link>
        <Link to="/tutor"><Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" />Ask Tutor</Button></Link>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">Documents</h2>
        {docs?.length ? (
          <div className="space-y-2">
            {docs.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><div><p className="font-medium">{d.title}</p><p className="text-xs text-muted-foreground">{d.file_type ?? "—"} · {d.page_count ?? 0} pages</p></div></div>
                <Badge variant={d.status === "ready" ? "default" : d.status === "failed" ? "destructive" : "secondary"}>{d.status}</Badge>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground">No documents yet.</p>}
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold"><Sparkles className="h-5 w-5 text-gold" />Topics</h2>
        {topics?.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {topics.map((t: any) => {
              const score = t.mastery_scores?.[0]?.score ?? 0;
              return (
                <Card key={t.id} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold">{t.name}</h3>
                    <Badge variant="outline">{t.mastery_scores?.[0]?.level ?? "weak"}</Badge>
                  </div>
                  <Progress value={Number(score)} />
                  <p className="mt-1 text-xs text-muted-foreground">{Math.round(Number(score))}% mastery</p>
                </Card>
              );
            })}
          </div>
        ) : <p className="text-sm text-muted-foreground">Topics will appear once documents are processed.</p>}
      </Card>
    </div>
  );
}
