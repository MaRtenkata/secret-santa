import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell width="max-w-md">
      <div className="card text-center">
        <p className="text-5xl">🧭</p>
        <h1 className="mt-2 font-display text-4xl text-berry">Lost in the snow</h1>
        <p className="mt-2 text-muted">
          This page doesn&apos;t exist. If you came from an invite email, check that you copied the whole link.
        </p>
        <Link href="/" className="btn-primary mt-5">
          Back to the start
        </Link>
      </div>
    </PageShell>
  );
}
