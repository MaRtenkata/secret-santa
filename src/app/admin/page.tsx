import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import PageShell from "@/components/PageShell";
import { requireAdmin } from "@/lib/auth";
import { listEvents } from "@/lib/queries";

export default async function AdminHome() {
  await requireAdmin();
  const events = await listEvents();

  return (
    <PageShell right={<AdminNav />}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-5xl text-berry">Твоите събития</h1>
        <Link href="/admin/events/new" className="btn-primary">
          + Ново събитие
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-5xl">🦌</p>
          <p className="mt-3 text-lg font-bold">Все още няма събития</p>
          <p className="text-muted">Създай събитие, добави участниците и приложението ще изпрати поканите.</p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/admin/events/${e.id}`}
                className="card flex flex-wrap items-center justify-between gap-3 transition hover:border-gold"
              >
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">{e.name}</p>
                  <p className="text-sm text-muted">
                    {e.total} участници{e.exchangeDate ? ` · ${e.exchangeDate}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    e.done === e.total ? "bg-pine/10 text-pine" : "bg-gold/15 text-[#8a6418]"
                  }`}
                >
                  {e.done}/{e.total} списъка
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
