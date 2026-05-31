import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TrendingUp, Flame, Target, Brain } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({ component: Analytics });

function Analytics() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: attempts } = useQuery({
    queryKey: ["attempts", uid],
    queryFn: async () => (await supabase.from("quiz_attempts").select("*").order("started_at", { ascending: false }).limit(20)).data ?? [],
    enabled: !!uid,
  });
  const { data: sessions } = useQuery({
    queryKey: ["sessions", uid],
    queryFn: async () => (await supabase.from("study_sessions").select("*").order("session_date", { ascending: false }).limit(30)).data ?? [],
    enabled: !!uid,
  });
  const { data: mastery } = useQuery({
    queryKey: ["mastery-all", uid],
    queryFn: async () => (await supabase.from("mastery_scores").select("*, topics(name)")).data ?? [],
    enabled: !!uid,
  });

  const avgAcc = attempts?.length ? Math.round(attempts.reduce((a: number, b: any) => a + Number(b.accuracy), 0) / attempts.length) : 0;
  const totalMin = sessions?.reduce((a: number, b: any) => a + (b.duration_minutes || 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Your learning, in numbers.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Target} label="Avg quiz accuracy" value={`${avgAcc}%`} />
        <StatCard icon={Brain} label="Mastery topics" value={String(mastery?.length ?? 0)} />
        <StatCard icon={Flame} label="Study minutes" value={String(totalMin)} />
        <StatCard icon={TrendingUp} label="Quiz attempts" value={String(attempts?.length ?? 0)} />
      </div>
      <Card className="p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">Mastery by Topic</h2>
        {mastery?.length ? mastery.map((m: any) => (
          <div key={m.id} className="mb-3">
            <div className="mb-1 flex justify-between text-sm"><span>{m.topics?.name}</span><Badge variant="outline">{m.level}</Badge></div>
            <Progress value={Number(m.score)} />
          </div>
        )) : <p className="text-sm text-muted-foreground">No mastery data yet.</p>}
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <Card className="p-4">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </Card>
  );
}
