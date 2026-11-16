"use client";

import { useActionState } from "react";
import PageShell from "@/components/PageShell";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <PageShell width="max-w-md">
      <form action={action} className="card mt-6 space-y-4">
        <div className="text-center">
          <p className="text-4xl">🔑</p>
          <h1 className="font-display text-4xl text-berry">Вход за организатора</h1>
        </div>
        <div>
          <label htmlFor="password" className="label">
            Парола
          </label>
          <input id="password" name="password" type="password" required autoFocus className="input" />
        </div>
        {state?.error && <p className="rounded-lg bg-berry/10 px-3 py-2 text-sm text-berry">{state.error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Проверка…" : "Вход"}
        </button>
      </form>
    </PageShell>
  );
}
