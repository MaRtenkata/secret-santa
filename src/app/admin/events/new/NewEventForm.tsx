"use client";

import { useActionState, useState } from "react";
import { createEvent } from "@/app/admin/actions";

type Row = { key: number; name: string; email: string };

let nextKey = 3;
const blank = (key: number): Row => ({ key, name: "", email: "" });

export default function NewEventForm() {
  const [state, action, pending] = useActionState(createEvent, undefined);
  const [rows, setRows] = useState<Row[]>([blank(0), blank(1), blank(2)]);
  const [fields, setFields] = useState({ name: "", budget: "", exchangeDate: "", message: "" });
  const bind = (field: keyof typeof fields) => ({
    id: field,
    name: field,
    value: fields[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [field]: e.target.value })),
  });

  const update = (key: number, field: "name" | "email", value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const filled = rows.filter((r) => r.name.trim() || r.email.trim());
  const optional = <span className="font-normal text-muted">(по желание)</span>;

  return (
    <form action={action} className="mt-8 grid gap-6">
      <section className="card grid gap-4">
        <h2 className="text-lg font-bold">Събитието</h2>
        <div>
          <label htmlFor="name" className="label">
            Име на събитието
          </label>
          <input {...bind("name")} required maxLength={100} placeholder="Семейна Коледа 2026" className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="budget" className="label">
              Бюджет {optional}
            </label>
            <input {...bind("budget")} maxLength={40} placeholder="30 €" className="input" />
          </div>
          <div>
            <label htmlFor="exchangeDate" className="label">
              Размяна на подаръците {optional}
            </label>
            <input {...bind("exchangeDate")} maxLength={60} placeholder="24 декември, у баба" className="input" />
          </div>
        </div>
        <div>
          <label htmlFor="message" className="label">
            Съобщение до всички {optional}
          </label>
          <textarea
            {...bind("message")}
            rows={3}
            maxLength={1000}
            placeholder="Пазете тайната! Без надничане 🎄"
            className="input resize-y"
          />
        </div>
      </section>

      <section className="card grid gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold">Участници</h2>
          <span className="text-sm text-muted">{filled.length} души · минимум 3</span>
        </div>
        <p className="-mt-2 text-sm text-muted">Ако и ти участваш, добави и себе си.</p>

        <ul className="grid gap-3">
          {rows.map((r, i) => (
            <li key={r.key} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
              <input
                aria-label={`Име на участник ${i + 1}`}
                placeholder="Име"
                value={r.name}
                onChange={(e) => update(r.key, "name", e.target.value)}
                className="input"
              />
              <input
                aria-label={`Имейл на участник ${i + 1}`}
                type="email"
                placeholder="email@example.com"
                value={r.email}
                onChange={(e) => update(r.key, "email", e.target.value)}
                className="input col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto"
              />
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                disabled={rows.length <= 3}
                aria-label={`Премахни участник ${i + 1}`}
                className="btn-ghost px-3 sm:row-start-auto"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, blank(nextKey++)])}
          className="btn-ghost justify-self-start"
        >
          + Добави участник
        </button>
      </section>

      <input
        type="hidden"
        name="participants"
        value={JSON.stringify(filled.map(({ name, email }) => ({ name, email })))}
      />

      {state?.error && <p className="rounded-xl bg-berry/10 px-4 py-3 font-semibold text-berry">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-berry text-lg" disabled={pending}>
          {pending ? "Теглене и изпращане на имейли…" : "🎁 Създай и изпрати поканите"}
        </button>
        <span className="text-sm text-muted">Може да отнеме няколко секунди.</span>
      </div>
    </form>
  );
}
