"use client";

import { useActionState, useState } from "react";
import { updateParticipant } from "@/app/admin/actions";

export default function EditParticipant({ id, name, email }: { id: string; name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ name, email });
  const [state, action, pending] = useActionState(updateParticipant, undefined);

  const emailChanged = values.email.trim().toLowerCase() !== email;

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setValues({ name, email });
            setOpen(true);
          }}
          className="btn-ghost px-3 py-1.5 text-sm"
        >
          ✏️ Промени
        </button>
        {state?.sent && <span className="text-sm font-semibold text-pine">Изпратено ✓</span>}
      </div>
    );
  }

  return (
    <form action={action} className="mt-3 grid w-full gap-3 rounded-xl border border-line bg-cream/60 p-4">
      <input type="hidden" name="participantId" value={id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`name-${id}`} className="label">
            Име
          </label>
          <input
            id={`name-${id}`}
            name="name"
            required
            maxLength={80}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            className="input"
          />
        </div>
        <div>
          <label htmlFor={`email-${id}`} className="label">
            Имейл
          </label>
          <input
            id={`email-${id}`}
            name="email"
            type="email"
            required
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            className="input"
          />
        </div>
      </div>
      {emailChanged && (
        <p className="text-sm text-muted">
          Ще бъде изпратен нов личен линк, а старият ще спре да работи. Списъкът с желания и тегленето се запазват.
        </p>
      )}
      {state?.error && <p className="rounded-lg bg-berry/10 px-3 py-2 text-sm font-semibold text-berry">{state.error}</p>}
      {state?.emailError && (
        <p className="rounded-lg bg-berry/10 px-3 py-2 text-sm font-semibold text-berry">
          Промените са запазени, но имейлът не беше изпратен: {state.emailError}
        </p>
      )}
      {state?.sent && <p className="text-sm font-semibold text-pine">Запазено и изпратено ✓</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn-primary text-sm" disabled={pending}>
          {pending ? "Изпращане…" : "Запази и изпрати отново"}
        </button>
        <button type="button" className="btn-ghost text-sm" onClick={() => setOpen(false)} disabled={pending}>
          Затвори
        </button>
      </div>
    </form>
  );
}
