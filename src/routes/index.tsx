import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Upload, Sparkles, Target, MessageSquare, TrendingUp, GraduationCap, ArrowRight, Check } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyOS — Upload once. Master everything." },
      { name: "description", content: "AI-powered study OS that turns your material into summaries, quizzes, flashcards, and a personalized revision plan." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Upload, title: "One Upload, Everything", desc: "PDFs, slides, docs. We extract, dedupe, and structure it for you." },
  { icon: Sparkles, title: "Smart Summaries", desc: "Quick, detailed, exam-mode, bullet notes — all auto-generated." },
  { icon: Brain, title: "Quizzes & Flashcards", desc: "MCQs, cloze, formulas. Spaced repetition built in." },
  { icon: Target, title: "Weak Topic Engine", desc: "Mastery scoring across 4 signals tells you what to revise." },
  { icon: MessageSquare, title: "AI Tutor", desc: "Grounded in your uploads. Every answer cites source pages." },
  { icon: TrendingUp, title: "Mastery Tracking", desc: "Track streaks, retention, accuracy trends, and progress insights." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/80 px-6 py-4 backdrop-blur">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><GraduationCap className="h-5 w-5" /></div>
          <span className="font-display text-xl font-bold">StudyOS</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/auth"><Button>Get Started</Button></Link>
        </div>
      </nav>

      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.42_0.09_160/0.12),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3 text-gold" />
            <span>AI Study Operating System</span>
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight md:text-6xl">
            Upload once. <span className="text-primary">Master everything.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            StudyOS turns your study material into summaries, quizzes, flashcards, mastery tracking, and a personalized revision plan — instantly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth"><Button size="lg" className="gap-2">Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/auth"><Button size="lg" variant="outline">Try Demo</Button></Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            "You don't need to study everything. StudyOS tells you exactly what to revise next and why."
          </p>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center font-display text-3xl font-bold">Everything you need to learn faster</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="p-6 transition-shadow hover:shadow-md">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-accent/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center font-display text-3xl font-bold">How it works</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: "1", t: "Upload", d: "Drop in PDFs, slides, notes — up to 100MB or 500 pages." },
              { n: "2", t: "AI Processes", d: "Topics, concepts, summaries, quizzes, and flashcards — generated." },
              { n: "3", t: "Study Smarter", d: "Follow your daily plan. Hit your weak spots first." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border bg-card p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">{s.n}</div>
                <h3 className="font-display text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center font-display text-3xl font-bold">Benefits</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {["Cut study time by focusing on weak topics", "Stop guessing what to revise next", "Spaced repetition keeps knowledge fresh", "Source-cited AI tutor 24/7", "Track real mastery, not just hours", "Works across all your subjects"].map((b) => (
              <div key={b} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary px-6 py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl font-bold">Start studying smarter today.</h2>
          <p className="mt-3 opacity-90">Free to get started. No credit card required.</p>
          <Link to="/auth"><Button size="lg" variant="secondary" className="mt-6 gap-2">Get Started <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </section>

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} StudyOS. Built for students who want to learn faster.
      </footer>
    </div>
  );
}
