import Link from "next/link";
import PageShell from "@/components/PageShell";

const steps = [
  { icon: "📝", title: "Names go in the hat", text: "The organiser adds everyone taking part." },
  { icon: "✉️", title: "Check your inbox", text: "You get an email with your own private link." },
  { icon: "🎁", title: "Write 3 wishes", text: "Add links or descriptions of things you'd love." },
  { icon: "🔓", title: "Meet your giftee", text: "Your list unlocks who you're buying for, and their list." },
];

export default function Home() {
  return (
    <PageShell>
      <section className="text-center">
        <p className="text-5xl">🎄</p>
        <h1 className="mt-2 font-display text-5xl text-berry sm:text-6xl">Ho ho ho!</h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-muted">
          A Secret Santa for friends and family. If you&apos;re taking part, open the link from your email to get
          started.
        </p>
      </section>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.title} className="card flex items-start gap-4">
            <span className="text-3xl">{s.icon}</span>
            <div>
              <h2 className="font-bold">{s.title}</h2>
              <p className="text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-center text-sm text-muted">
        Organising?{" "}
        <Link href="/admin" className="font-semibold text-pine underline underline-offset-4">
          Go to the organiser area
        </Link>
      </p>
    </PageShell>
  );
}
