"use client";

import { useActionState, useState } from "react";
import WishList from "@/components/WishList";
import { MAX_WISHES, MIN_WISHES } from "@/lib/validation";
import { saveWishlist, type WishlistState } from "./actions";

type Wish = { title: string; url: string; description: string };
type Row = Wish & { key: number };

let nextKey = 0;
const toRow = (w: Wish): Row => ({ ...w, key: nextKey++ });
const blank = (): Row => toRow({ title: "", url: "", description: "" });
const placeholders = ["Топли вълнени чорапи", "Хубав криминален роман", "Настолна игра"];

/** The saved wishes, padded with empty rows up to the minimum. */
const rowsFrom = (wishes: Wish[]) => [
  ...wishes.map(toRow),
  ...Array.from({ length: Math.max(0, MIN_WISHES - wishes.length) }, blank),
];

export default function WishlistSection({ token, initial }: { token: string; initial: Wish[] }) {
  const complete = initial.length >= MIN_WISHES;
  const [editing, setEditing] = useState(!complete);
  const [rows, setRows] = useState<Row[]>(() => rowsFrom(initial));

  const [state, action, pending] = useActionState(async (prev: WishlistState, fd: FormData) => {
    const result = await saveWishlist(token, prev, fd);
    if (result?.saved) setEditing(false);
    return result;
  }, undefined);

  const update = (key: number, field: keyof Wish, value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const optional = <span className="font-normal text-muted">(по желание)</span>;

  if (!editing) {
    return (
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-pine">Твоят списък с желания</h2>
          <button
            type="button"
            onClick={() => {
              setRows(rowsFrom(initial));
              setEditing(true);
            }}
            className="btn-ghost text-sm"
          >
            ✏️ Редактирай или добави
          </button>
        </div>
        {state?.saved && (
          <p className="mt-1 text-sm font-semibold text-pine">Запазено! Твоят Таен Дядо Коледа вече може да го види.</p>
        )}
        <div className="mt-4">
          <WishList items={initial.map((w, i) => ({ position: i + 1, ...w }))} />
        </div>
      </section>
    );
  }

  return (
    <form action={action} className="card grid gap-5">
      <div>
        <h2 className="font-display text-3xl text-pine">Твоят списък с желания</h2>
        <p className="text-muted">
          Добави поне {MIN_WISHES} неща, които би искал(а) да получиш (до {MAX_WISHES}). Линкът и описанието не са
          задължителни, но помагат.
        </p>
      </div>

      {rows.map((w, i) => {
        const n = i + 1;
        return (
          <fieldset key={w.key} className="grid gap-3 rounded-xl border border-line bg-cream/50 p-4">
            <legend className="rounded-full bg-berry px-3 py-0.5 text-sm font-bold text-white">Желание {n}</legend>
            {rows.length > MIN_WISHES && (
              <button
                type="button"
                onClick={() => setRows((rs) => rs.filter((r) => r.key !== w.key))}
                className="-mt-2 justify-self-end text-sm font-semibold text-berry hover:underline"
              >
                ✕ Премахни
              </button>
            )}
            <div>
              <label htmlFor={`title${n}`} className="label">
                Какво е?
              </label>
              <input
                id={`title${n}`}
                name={`title${n}`}
                required
                maxLength={120}
                value={w.title}
                onChange={(e) => update(w.key, "title", e.target.value)}
                placeholder={placeholders[i] ?? "Още нещо, което би те зарадвало"}
                className="input"
              />
            </div>
            <div>
              <label htmlFor={`url${n}`} className="label">
                Линк {optional}
              </label>
              <input
                id={`url${n}`}
                name={`url${n}`}
                type="text"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                maxLength={2000}
                value={w.url}
                onChange={(e) => update(w.key, "url", e.target.value)}
                placeholder="https://…"
                className="input"
              />
            </div>
            <div>
              <label htmlFor={`description${n}`} className="label">
                Описание {optional}
              </label>
              <textarea
                id={`description${n}`}
                name={`description${n}`}
                rows={2}
                maxLength={500}
                value={w.description}
                onChange={(e) => update(w.key, "description", e.target.value)}
                placeholder="Размер, цвят, всичко, което помага"
                className="input resize-y"
              />
            </div>
          </fieldset>
        );
      })}

      {rows.length < MAX_WISHES && (
        <button type="button" onClick={() => setRows((rs) => [...rs, blank()])} className="btn-ghost justify-self-start">
          + Добави още едно желание
        </button>
      )}

      {state?.error && <p className="rounded-xl bg-berry/10 px-4 py-3 font-semibold text-berry">{state.error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-berry text-lg" disabled={pending}>
          {pending ? "Запазване…" : complete ? "Запази промените" : "🎁 Запази и виж на кого подаряваш"}
        </button>
        {complete && (
          <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>
            Отказ
          </button>
        )}
      </div>
    </form>
  );
}
