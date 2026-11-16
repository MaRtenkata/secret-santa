import Link from "next/link";

export default function PageShell({
  children,
  right,
  width = "max-w-3xl",
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  width?: string;
}) {
  return (
    <>
      <header className="bg-berry text-cream shadow-md">
        <div className={`mx-auto flex ${width} items-center justify-between gap-4 px-4 py-3`}>
          <Link href="/" className="font-display text-2xl leading-none sm:text-3xl">
            🎅 Таен Дядо Коледа
          </Link>
          {right}
        </div>
        <div className="h-1.5 bg-[repeating-linear-gradient(135deg,var(--color-cream)_0_10px,var(--color-berry)_10px_20px)] opacity-60" />
      </header>
      <main className={`mx-auto ${width} px-4 py-8 sm:py-10`}>{children}</main>
    </>
  );
}
