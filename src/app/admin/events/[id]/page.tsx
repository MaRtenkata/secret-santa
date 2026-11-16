import { notFound } from "next/navigation";
import { deleteEvent, remindMissingWishlists, resendEmail } from "@/app/admin/actions";
import AdminNav from "@/components/AdminNav";
import PageShell from "@/components/PageShell";
import SubmitButton from "@/components/SubmitButton";
import { requireAdmin } from "@/lib/auth";
import { getEventWithPeople } from "@/lib/queries";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const data = await getEventWithPeople(id);
  if (!data) notFound();
  const { event, people } = data;

  const done = people.filter((p) => p.wishCount >= 3).length;
  const failed = people.filter((p) => p.emailError).length;
  const missing = people.length - done;

  return (
    <PageShell right={<AdminNav />}>
      <h1 className="font-display text-5xl text-berry">{event.name}</h1>
      <p className="mt-1 text-muted">
        {[event.budget && `Бюджет ${event.budget}`, event.exchangeDate].filter(Boolean).join(" · ") ||
          "Без бюджет и дата"}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Участници" value={people.length} />
        <Stat
          label="Готови списъци"
          value={`${done}/${people.length}`}
          tone={done === people.length ? "good" : "warn"}
        />
        <Stat label="Неуспешни имейли" value={failed} tone={failed ? "bad" : "good"} />
      </div>

      <section className="card mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Участници</h2>
          {missing > 0 && (
            <form action={remindMissingWishlists}>
              <input type="hidden" name="eventId" value={event.id} />
              <SubmitButton className="btn-ghost text-sm" pendingText="Изпращане на напомняния…">
                ✉️ Напомни на {missing} без списък
              </SubmitButton>
            </form>
          )}
        </div>
        <p className="mt-1 text-sm text-muted">Кой на кого подарява остава тайна, дори за теб.</p>

        <ul className="mt-4 divide-y divide-line">
          {people.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-semibold">{p.name}</p>
                <p className="truncate text-sm text-muted">{p.email}</p>
                {p.emailError && <p className="mt-1 text-sm text-berry">Имейлът не е изпратен: {p.emailError}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge ok={p.wishCount >= 3} okText="🎁 Списъкът е готов" noText={`📝 ${p.wishCount}/3 желания`} />
                <Badge ok={!!p.emailSentAt && !p.emailError} okText="✉️ Изпратен" noText="✉️ Не е изпратен" />
                <form action={resendEmail}>
                  <input type="hidden" name="participantId" value={p.id} />
                  <SubmitButton className="btn-ghost px-3 py-1.5 text-sm" pendingText="Изпращане…">
                    Изпрати отново
                  </SubmitButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <details className="card mt-6">
        <summary className="cursor-pointer font-semibold text-berry">Изтрий събитието</summary>
        <form action={deleteEvent} className="mt-4 grid gap-3">
          <input type="hidden" name="eventId" value={event.id} />
          <label htmlFor="confirm" className="label">
            Това ще изтрие всички списъци и линкове. Напиши <b>{event.name}</b>, за да потвърдиш.
          </label>
          <input id="confirm" name="confirm" className="input" autoComplete="off" />
          <SubmitButton className="btn-berry justify-self-start" pendingText="Изтриване…">
            Изтрий събитието
          </SubmitButton>
        </form>
      </details>
    </PageShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: "good" | "warn" | "bad" }) {
  const color =
    tone === "good" ? "text-pine" : tone === "warn" ? "text-[#8a6418]" : tone === "bad" ? "text-berry" : "text-ink";
  return (
    <div className="card">
      <p className="text-sm text-muted">{label}</p>
      <p className={`text-3xl font-extrabold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

function Badge({ ok, okText, noText }: { ok: boolean; okText: string; noText: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${ok ? "bg-pine/10 text-pine" : "bg-gold/15 text-[#8a6418]"}`}
    >
      {ok ? okText : noText}
    </span>
  );
}
