import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Brain } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/flashcards")({ component: Flashcards });

function Flashcards() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;
  const today = new Date().toISOString().slice(0, 10);

  const { data: cards } = useQuery({
    queryKey: ["due-cards", uid],
    queryFn: async () => (await supabase.from("flashcards").select("*").lte("due_date", today).order("due_date").limit(20)).data ?? [],
    enabled: !!uid,
  });

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards?.[idx];
  const retention = useMemo(() => {
    if (!cards?.length) return 0;
    const easy = cards.filter((c: any) => c.last_rating === "easy").length;
    return Math.round((easy / cards.length) * 100);
  }, [cards]);

  const rate = async (rating: "easy" | "medium" | "hard" | "again") => {
    if (!card || !uid) return;
    const intervalMap: any = { easy: card.interval_days * 2.5, medium: card.interval_days * 1.8, hard: card.interval_days * 1.2, again: 1 };
    const newInterval = Math.max(1, Math.round(intervalMap[rating]));
    const next = new Date(); next.setDate(next.getDate() + newInterval);
    await supabase.from("flashcards").update({
      ease: rating === "easy" ? card.ease + 0.15 : rating === "again" ? Math.max(1.3, card.ease - 0.2) : card.ease,
      interval_days: newInterval, due_date: next.toISOString().slice(0, 10),
      review_count: card.review_count + 1, last_rating: rating,
    }).eq("id", card.id);
    await supabase.from("flashcard_reviews").insert({ user_id: uid, flashcard_id: card.id, rating });
    setFlipped(false);
    if (idx + 1 >= (cards?.length ?? 0)) { qc.invalidateQueries({ queryKey: ["due-cards"] }); setIdx(0); toast.success("Session complete!"); }
    else setIdx(idx + 1);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Flashcards</h1>
          <p className="text-muted-foreground">{cards?.length ?? 0} due · {retention}% retention</p>
        </div>
        <Brain className="h-8 w-8 text-primary" />
      </div>

      {card ? (
        <>
          <Card className="min-h-[300px] cursor-pointer p-10 text-center transition-all hover:shadow-lg" onClick={() => setFlipped(!flipped)}>
            <Badge className="mb-4">{flipped ? "Answer" : "Question"} · {idx + 1}/{cards?.length}</Badge>
            <p className="font-display text-2xl">{flipped ? card.back : card.front}</p>
            {!flipped && <p className="mt-4 text-xs text-muted-foreground">Click to flip</p>}
          </Card>
          {flipped && (
            <div className="grid grid-cols-4 gap-2">
              <Button variant="destructive" onClick={() => rate("again")}>Again</Button>
              <Button variant="outline" onClick={() => rate("hard")}>Hard</Button>
              <Button variant="outline" onClick={() => rate("medium")}>Good</Button>
              <Button onClick={() => rate("easy")}>Easy</Button>
            </div>
          )}
        </>
      ) : (
        <Card className="p-12 text-center">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-3 font-display text-xl font-semibold">All caught up!</h2>
          <p className="mt-1 text-muted-foreground">No cards due. Upload material to generate more.</p>
        </Card>
      )}
    </div>
  );
}
