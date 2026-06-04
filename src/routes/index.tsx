import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/chess/Board";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "שחמט נגד המחשב — שח-מט ישראל" },
      {
        name: "description",
        content: "שחק שחמט מול המחשב עם שלוש רמות קושי — ישירות בדפדפן, בעברית, חינם.",
      },
      { property: "og:title", content: "שחמט נגד המחשב — שח-מט ישראל" },
      {
        property: "og:description",
        content: "שחק שחמט מול המחשב עם שלוש רמות קושי — ישירות בדפדפן, בעברית, חינם.",
      },
      { property: "og:url", content: "https://chess-israel.lovable.app/" },
    ],
    links: [
      { rel: "canonical", href: "https://chess-israel.lovable.app/" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[var(--page-bg)] px-4 py-8 sm:py-12"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(180,140,90,0.15), transparent 50%), radial-gradient(circle at 80% 90%, rgba(90,60,30,0.15), transparent 50%)",
      }}
    >
      <main className="mx-auto flex max-w-2xl flex-col items-center">
        <header className="mb-6 text-center">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--ink)] sm:text-5xl">
            שחמט נגד המחשב
          </h1>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            אתה הלבן · המחשב משחק בשחור
          </p>
        </header>
        <Board />
      </main>
    </div>
  );
}
