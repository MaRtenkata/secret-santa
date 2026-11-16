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

  if (!editing) {
    return (
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl text-pine">Your wishlist</h2>
          <button type="button" onClick={() => setEditing(true)} className="btn-ghost text-sm">
            ✏️ Edit
          </button>
        </div>
        {state?.saved && <p className="mt-1 text-sm font-semibold text-pine">Saved! Your Secret Santa can see it now.</p>}
        <div className="mt-4">
          <WishList items={initial.map((w, i) => ({ position: i + 1, ...w }))} />
        </div>
      </section>
    );
  }

  return (
    <form action={action} className="card grid gap-5">
      <div>
        <h2 className="font-display text-3xl text-pine">Your wishlist</h2>
        <p className="text-muted">
          Add 3 things you&apos;d love to get. For each one, paste a link to it, describe it, or both.
        </p>
      </div>

      {wishes.map((w, i) => {
        const n = i + 1;
        return (
          <fieldset key={n} className="grid gap-3 rounded-xl border border-line bg-cream/50 p-4">
            <legend className="rounded-full bg-berry px-3 py-0.5 text-sm font-bold text-white">Wish {n}</legend>
            <div>
              <label htmlFor={`title${n}`} className="label">
                What is it?
              </label>
              <input
                id={`title${n}`}
                name={`title${n}`}
                required
                maxLength={120}
                value={w.title}
                onChange={(e) => update(i, "title", e.target.value)}
                placeholder={["Cosy wool socks", "A good mystery novel", "Board game night"][i]}
                className="input"
              />
            </div>
            <div>
              <label htmlFor={`url${n}`} className="label">
                Link <span className="font-normal text-muted">(optional)</span>
              </label>
              <input
                id={`url${n}`}
                name={`url${n}`}
                type="url"
                inputMode="url"
                maxLength={2000}
                value={w.url}
                onChange={(e) => update(i, "url", e.target.value)}
                placeholder="https://…"
                className="input"
              />
            </div>
            <div>
              <label htmlFor={`description${n}`} className="label">
                Description <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                id={`description${n}`}
                name={`description${n}`}
                rows={2}
                maxLength={500}
                value={w.description}
                onChange={(e) => update(i, "description", e.target.value)}
                placeholder="Size, colour, anything that helps"
                className="input resize-y"
              />
            </div>
          </fieldset>
        );
      })}

      {state?.error && <p className="rounded-xl bg-berry/10 px-4 py-3 font-semibold text-berry">{state.error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-berry text-lg" disabled={pending}>
          {pending ? "Saving…" : complete ? "Save changes" : "🎁 Save & reveal my giftee"}
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
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
