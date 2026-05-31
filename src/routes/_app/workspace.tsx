import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { BookOpen, Plus, FolderOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/workspace")({ component: Workspace });

function Workspace() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;

  const { data: subjects } = useQuery({
    queryKey: ["subjects", uid],
    queryFn: async () => (await supabase.from("subjects").select("*, courses(*)").order("created_at")).data ?? [],
    enabled: !!uid,
  });

  const [subjectName, setSubjectName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseSubject, setCourseSubject] = useState("");

  const createSubject = async () => {
    if (!subjectName.trim() || !uid) return;
    const { error } = await supabase.from("subjects").insert({ user_id: uid, name: subjectName });
    if (error) return toast.error(error.message);
    setSubjectName(""); qc.invalidateQueries({ queryKey: ["subjects"] }); toast.success("Subject created");
  };
  const createCourse = async () => {
    if (!courseName.trim() || !courseSubject || !uid) return;
    const { error } = await supabase.from("courses").insert({ user_id: uid, subject_id: courseSubject, name: courseName });
    if (error) return toast.error(error.message);
    setCourseName(""); qc.invalidateQueries({ queryKey: ["subjects"] }); toast.success("Course created");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Workspace</h1>
          <p className="text-muted-foreground">Subjects → Courses → Documents</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline" className="gap-2"><Plus className="h-4 w-4" />Subject</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New subject</DialogTitle></DialogHeader>
              <Label>Name</Label>
              <Input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="e.g. Computer Science" />
              <Button onClick={createSubject}>Create</Button>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Course</Button></DialogTrigger>
            <DialogContent className="space-y-3">
              <DialogHeader><DialogTitle>New course</DialogTitle></DialogHeader>
              <div><Label>Subject</Label>
                <Select value={courseSubject} onValueChange={setCourseSubject}>
                  <SelectTrigger><SelectValue placeholder="Pick subject" /></SelectTrigger>
                  <SelectContent>{subjects?.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Course name</Label><Input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="e.g. Deep Learning" /></div>
              <Button onClick={createCourse}>Create</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
