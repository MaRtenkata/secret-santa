import Link from "next/link";
import PageShell from "@/components/PageShell";

const steps = [
  { icon: "📝", title: "Имената влизат в шапката", text: "Организаторът добавя всички участници." },
  { icon: "✉️", title: "Провери пощата си", text: "Ще получиш имейл с твоя личен линк." },
  { icon: "🎁", title: "Напиши 3 желания", text: "Добави линкове или описания на неща, които искаш." },
  { icon: "🔓", title: "Виж на кого подаряваш", text: "Списъкът ти отключва името и желанията на човека." },
];

export default function Home() {
  return (
    <PageShell>
      <section className="text-center">
        <p className="text-5xl">🎄</p>
        <h1 className="mt-2 font-display text-5xl text-berry sm:text-6xl">Хо-хо-хо!</h1>
        <p className="mx-auto mt-3 max-w-md text-lg text-muted">
          Таен Дядо Коледа за приятели и семейство. Ако участваш, отвори линка от имейла си, за да започнеш.
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
        Ти организираш?{" "}
        <Link href="/admin" className="font-semibold text-pine underline underline-offset-4">
          Към страницата на организатора
        </Link>
      </p>
    </PageShell>
  );
}
