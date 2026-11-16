import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell width="max-w-md">
      <div className="card text-center">
        <p className="text-5xl">🧭</p>
        <h1 className="mt-2 font-display text-4xl text-berry">Изгубени в снега</h1>
        <p className="mt-2 text-muted">
          Тази страница не съществува. Ако идваш от имейл с покана, провери дали си копирал целия линк.
        </p>
        <Link href="/" className="btn-primary mt-5">
          Към началото
        </Link>
      </div>
    </PageShell>
  );
}
