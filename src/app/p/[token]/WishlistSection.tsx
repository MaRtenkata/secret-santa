"use client";

import { useActionState, useState } from "react";
import WishList from "@/components/WishList";
import { saveWishlist, type WishlistState } from "./actions";

type Wish = { title: string; url: string; description: string };

export default function WishlistSection({ token, initial }: { token: string; initial: Wish[] }) {
  const complete = initial.length === 3;
  const [editing, setEditing] = useState(!complete);
  const [wishes, setWishes] = useState<Wish[]>(
    complete ? initial : [0, 1, 2].map((i) => initial[i] ?? { title: "", url: "", description: "" }),
  );

  const [state, action, pending] = useActionState(async (prev: WishlistState, fd: FormData) => {
    const result = await saveWishlist(token, prev, fd);
    if (result?.saved) setEditing(false);
    return result;
  }, undefined);

  const update = (i: number, field: keyof Wish, value: string) =>
    setWishes((ws) => ws.map((w, j) => (j === i ? { ...w, [field]: value } : w)));

  const optional = <span className="font-normal text-muted">(по желание)</span>;

  if (!editing) {
    return (
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-pine">Твоят списък с желания</h2>
          <button type="button" onClick={() => setEditing(true)} className="btn-ghost text-sm">
            ✏️ Редактирай
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
          Добави 3 неща, които би искал(а) да получиш. Линкът и описанието не са задължителни, но помагат.
        </p>
      </div>

      {wishes.map((w, i) => {
        const n = i + 1;
        return (
          <fieldset key={n} className="grid gap-3 rounded-xl border border-line bg-cream/50 p-4">
            <legend className="rounded-full bg-berry px-3 py-0.5 text-sm font-bold text-white">Желание {n}</legend>
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
                onChange={(e) => update(i, "title", e.target.value)}
                placeholder={["Топли вълнени чорапи", "Хубав криминален роман", "Настолна игра"][i]}
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
                onChange={(e) => update(i, "url", e.target.value)}
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
                onChange={(e) => update(i, "description", e.target.value)}
                placeholder="Размер, цвят, всичко, което помага"
                className="input resize-y"
              />
            </div>
          </fieldset>
        );
      })}

      {state?.error && <p className="rounded-xl bg-berry/10 px-4 py-3 font-semibold text-berry">{state.error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-berry text-lg" disabled={pending}>
          {pending ? "Запазване…" : complete ? "Запази промените" : "🎁 Запази и виж на кого подаряваш"}
        </button>
        {complete && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setWishes(initial);
              setEditing(false);
            }}
          >
            Отказ
          </button>
        )}
      </div>
    </form>
  );
}
