import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

function Onboarding() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [program, setProgram] = useState("");
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [goal, setGoal] = useState("");

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      program,
      subjects_list: subjects.split(",").map((s) => s.trim()).filter(Boolean),
      exam_date: examDate || null,
      study_goal: goal,
      onboarded: true,
    }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("All set!");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg p-8">
        <h1 className="font-display text-2xl font-bold">Tell us about your studies</h1>
        <p className="mt-1 text-sm text-muted-foreground">Takes under 2 minutes. We'll personalize everything.</p>
        <div className="mt-6 space-y-4">
          <div><Label>Degree / Program</Label><Input placeholder="e.g. BSc Computer Science" value={program} onChange={(e) => setProgram(e.target.value)} /></div>
          <div><Label>Subjects (comma-separated)</Label><Input placeholder="AI, Databases, Algorithms" value={subjects} onChange={(e) => setSubjects(e.target.value)} /></div>
          <div><Label>Next exam date</Label><Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /></div>
          <div><Label>Study goal</Label><Textarea placeholder="e.g. Pass finals with distinction" value={goal} onChange={(e) => setGoal(e.target.value)} /></div>
          <Button className="w-full" onClick={save}>Continue to Dashboard</Button>
        </div>
      </Card>
    </div>
  );
}
