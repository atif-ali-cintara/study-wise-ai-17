import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, Plus, FolderOpen, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/workspace")({ component: Workspace });

type DialogKind = null | "subject" | "course";

function Workspace() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;

  const { data: subjects } = useQuery({
    queryKey: ["subjects", uid],
    queryFn: async () => (await supabase.from("subjects").select("*, courses(*)").order("created_at")).data ?? [],
    enabled: !!uid,
  });

  const [dialog, setDialog] = useState<DialogKind>(null);
  const [subjectName, setSubjectName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [topicName, setTopicName] = useState("");
  const [courseSubject, setCourseSubject] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => {
    setDialog(null);
    setSubjectName(""); setCourseName(""); setTopicName(""); setCourseSubject("");
  };

  const createSubject = async () => {
    if (!subjectName.trim() || !uid) return;
    setBusy(true);
    const { error } = await supabase.from("subjects").insert({ user_id: uid, name: subjectName.trim() });
    setBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["subjects"] });
    toast.success("Subject created");
    close();
  };

  const createCourse = async () => {
    if (!courseName.trim() || !courseSubject || !uid) {
      return toast.error("Pick a subject and enter a course name");
    }
    setBusy(true);
    const { data: course, error } = await supabase
      .from("courses")
      .insert({ user_id: uid, subject_id: courseSubject, name: courseName.trim() })
      .select("id")
      .single();
    if (error || !course) {
      setBusy(false);
      return toast.error(error?.message ?? "Could not create course");
    }
    if (topicName.trim()) {
      const { error: tErr } = await supabase.from("topics").insert({
        user_id: uid,
        course_id: course.id,
        name: topicName.trim(),
      });
      if (tErr) {
        setBusy(false);
        return toast.error(tErr.message);
      }
    }
    setBusy(false);
    qc.invalidateQueries({ queryKey: ["subjects"] });
    toast.success(topicName.trim() ? "Course and topic created" : "Course created");
    close();
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Workspace</h1>
          <p className="text-muted-foreground">Subjects → Courses → Topics</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDialog("course")}>New course</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDialog("subject")}>New subject</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={dialog === "subject"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="space-y-3">
          <DialogHeader><DialogTitle>New subject</DialogTitle></DialogHeader>
          <div>
            <Label>Subject name</Label>
            <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Computer Science" />
          </div>
          <Button onClick={createSubject} disabled={busy}>{busy ? "Creating…" : "Create subject"}</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "course"} onOpenChange={(o) => !o && close()}>
        <DialogContent className="space-y-3">
          <DialogHeader><DialogTitle>New course</DialogTitle></DialogHeader>
          <div>
            <Label>Subject</Label>
            <Select value={courseSubject} onValueChange={setCourseSubject}>
              <SelectTrigger><SelectValue placeholder={subjects?.length ? "Pick subject" : "Create a subject first"} /></SelectTrigger>
              <SelectContent>
                {subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Course Name</Label>
            <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Principles of Management" />
          </div>
          <div>
            <Label>Topic Name <span className="text-xs text-muted-foreground">(optional)</span></Label>
            <Input value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="e.g. Chapter 1: Planning" />
          </div>
          <Button onClick={createCourse} disabled={busy}>{busy ? "Creating…" : "Create course"}</Button>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {subjects?.map((s: any) => (
          <Card key={s.id} className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold">{s.name}</h2>
            </div>
            {s.courses?.length ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {s.courses.map((c: any) => (
                  <Link key={c.id} to="/workspace/course/$courseId" params={{ courseId: c.id }}>
                    <Card className="p-4 transition-shadow hover:shadow-md">
                      <FolderOpen className="h-5 w-5 text-gold" />
                      <h3 className="mt-2 font-semibold">{c.name}</h3>
                      {c.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No courses yet.</p>
            )}
          </Card>
        ))}
        {!subjects?.length && <Card className="p-12 text-center text-muted-foreground">Create your first subject to get started.</Card>}
      </div>
    </div>
  );
}
