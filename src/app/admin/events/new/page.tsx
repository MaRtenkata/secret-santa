import AdminNav from "@/components/AdminNav";
import PageShell from "@/components/PageShell";
import { requireAdmin } from "@/lib/auth";
import NewEventForm from "./NewEventForm";

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <PageShell right={<AdminNav />}>
      <h1 className="font-display text-5xl text-berry">New Secret Santa</h1>
      <p className="mt-1 text-muted">
        When you press <b>Create &amp; send invites</b>, names are drawn and everyone gets an email with their private link.
      </p>
      <NewEventForm />
    </PageShell>
  );
}
