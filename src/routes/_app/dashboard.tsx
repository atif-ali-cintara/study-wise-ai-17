import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Brain, Upload, Target, Flame, ArrowRight, BookOpen, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user } = useAuth();
  const uid = user?.id;

  const { data: profile } = useQuery({
    queryKey: ["profile", uid],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", uid!).single()).data,
    enabled: !!uid,
  });
  const { data: courses } = useQuery({
    queryKey: ["courses", uid],
    queryFn: async () => (await supabase.from("courses").select("*, subjects(name)").order("created_at", { ascending: false }).limit(5)).data ?? [],
    enabled: !!uid,
  });
  const { data: mastery } = useQuery({
    queryKey: ["mastery", uid],
    queryFn: async () => (await supabase.from("mastery_scores").select("*, topics(name)").order("score", { ascending: true }).limit(5)).data ?? [],
    enabled: !!uid,
  });
  const { data: due } = useQuery({
    queryKey: ["due", uid],
    queryFn: async () => (await supabase.from("flashcards").select("id", { count: "exact", head: true }).lte("due_date", new Date().toISOString().slice(0,10))),
    enabled: !!uid,
  });

  const dueCount = due?.count ?? 0;
  const name = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Welcome back, {name} 👋</h1>
        <p className="mt-1 text-muted-foreground">Here's what to focus on today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Flame} label="Streak" value={`${profile?.streak_count ?? 0} days`} tone="warning" />
        <StatCard icon={Brain} label="Due reviews" value={String(dueCount)} tone="primary" />
        <StatCard icon={Target} label="Daily goal" value={`${profile?.daily_goal_minutes ?? 30} min`} tone="success" />
        <StatCard icon={BookOpen} label="Courses" value={String(courses?.length ?? 0)} tone="gold" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-gold" /> Today's Focus</h2>
            <Badge variant="secondary">AI-generated</Badge>
          </div>
          <div className="space-y-2">
            <FocusItem title="Review Due Flashcards" desc={`${dueCount} cards waiting`} href="/flashcards" />
            <FocusItem title="Upload a Document" desc="Add new material to study" href="/upload" />
            <FocusItem title="Ask the AI Tutor" desc="Get unstuck on any topic" href="/tutor" />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 font-display text-xl font-semibold">Weak Topics</h2>
          {mastery && mastery.length > 0 ? (
            <div className="space-y-3">
              {mastery.map((m: any) => (
                <div key={m.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{m.topics?.name ?? "Topic"}</span>
                    <span className="text-muted-foreground">{Math.round(Number(m.score))}%</span>
                  </div>
                  <Progress value={Number(m.score)} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Take a quiz to start tracking mastery.</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent Courses</h2>
          <Link to="/workspace"><Button variant="ghost" size="sm" className="gap-1">View all <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
        {courses && courses.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c: any) => (
              <Link key={c.id} to="/workspace/course/$courseId" params={{ courseId: c.id }}>
                <Card className="p-4 transition-shadow hover:shadow-md">
                  <p className="text-xs text-muted-foreground">{c.subjects?.name}</p>
                  <h3 className="mt-1 font-semibold">{c.name}</h3>
                  {c.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No courses yet. Upload your first document.</p>
            <Link to="/upload"><Button className="mt-4">Upload material</Button></Link>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }: any) {
  const toneMap: any = { primary: "bg-primary/10 text-primary", warning: "bg-warning/15 text-warning", success: "bg-success/15 text-success", gold: "bg-gold/15 text-gold" };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneMap[tone]}`}><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function FocusItem({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link to={href} className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
