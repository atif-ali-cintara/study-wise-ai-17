import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/search")({ component: SearchPage });

function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!q.trim()) return;
    setLoading(true);
    const term = `%${q}%`;
    const [docs, topics, summaries] = await Promise.all([
      supabase.from("documents").select("id,title").ilike("title", term).limit(10),
      supabase.from("topics").select("id,name,course_id").ilike("name", term).limit(10),
      supabase.from("summaries").select("id,content,document_id").ilike("content", term).limit(10),
    ]);
    setResults([
      ...(docs.data ?? []).map((d) => ({ ...d, kind: "Document" })),
      ...(topics.data ?? []).map((t) => ({ ...t, kind: "Topic" })),
      ...(summaries.data ?? []).map((s) => ({ ...s, kind: "Summary", title: (s.content ?? "").slice(0, 80) })),
    ]);
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-bold">Search</h1>
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Search documents, topics, summaries…" />
        <Button onClick={search} disabled={loading}><SearchIcon className="h-4 w-4" /></Button>
      </div>
      <div className="space-y-2">
        {results.map((r, i) => (
          <Card key={i} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-primary" /><span className="line-clamp-1">{r.title || r.name}</span></div>
            <Badge variant="outline">{r.kind}</Badge>
          </Card>
        ))}
        {!loading && q && results.length === 0 && <p className="text-sm text-muted-foreground">No results.</p>}
      </div>
    </div>
  );
}
