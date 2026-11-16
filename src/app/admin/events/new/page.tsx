import AdminNav from "@/components/AdminNav";
import PageShell from "@/components/PageShell";
import { requireAdmin } from "@/lib/auth";
import NewEventForm from "./NewEventForm";

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <PageShell right={<AdminNav />}>
      <h1 className="font-display text-5xl text-berry">Нов Таен Дядо Коледа</h1>
      <p className="mt-1 text-muted">
        Когато натиснеш <b>Създай и изпрати поканите</b>, имената се теглят и всеки получава имейл с личния си линк.
      </p>
      <NewEventForm />
    </PageShell>
  );
}
