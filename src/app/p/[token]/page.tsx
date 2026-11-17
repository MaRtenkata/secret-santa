import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, events, participants } from "@/db";
import PageShell from "@/components/PageShell";
import WishList from "@/components/WishList";
import { getWishlist } from "@/lib/queries";
import { MIN_WISHES } from "@/lib/validation";
import WishlistSection from "./WishlistSection";

export const metadata: Metadata = { referrer: "no-referrer" };

export default async function ParticipantPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) notFound();

  const me = (await db().select().from(participants).where(eq(participants.token, token)))[0];
  if (!me) notFound();
  const event = (await db().select().from(events).where(eq(events.id, me.eventId)))[0];
  const myWishes = await getWishlist(me.id);
  const unlocked = myWishes.length >= MIN_WISHES;

  // The giftee is only looked up once the wishlist is complete, so it never reaches the browser before then.
  let giftee: { name: string; wishes: Awaited<ReturnType<typeof getWishlist>> } | null = null;
  if (unlocked && me.assignedToId) {
    const g = (await db().select().from(participants).where(eq(participants.id, me.assignedToId)))[0];
    if (g) giftee = { name: g.name, wishes: await getWishlist(g.id) };
  }

  return (
    <PageShell>
      <section className="text-center">
        <p className="text-sm font-semibold tracking-widest text-muted uppercase">{event.name}</p>
        <h1 className="mt-1 font-display text-5xl text-berry">Здравей, {me.name}!</h1>
        {(event.budget || event.exchangeDate) && (
          <p className="mt-2 flex flex-wrap justify-center gap-2 text-sm">
            {event.budget && (
              <span className="rounded-full bg-gold/15 px-3 py-1 font-semibold">💰 Бюджет {event.budget}</span>
            )}
            {event.exchangeDate && (
              <span className="rounded-full bg-gold/15 px-3 py-1 font-semibold">📅 {event.exchangeDate}</span>
            )}
          </p>
        )}
        {event.message && (
          <p className="mx-auto mt-4 max-w-lg whitespace-pre-line rounded-xl border-l-4 border-gold bg-paper px-4 py-3 text-left">
            {event.message}
          </p>
        )}
      </section>

      <div className="mt-8 grid gap-6">
        {giftee ? (
          <section className="reveal card border-2 border-pine">
            <p className="text-center text-sm font-semibold tracking-widest text-muted uppercase">Ти подаряваш на</p>
            <p className="mt-1 text-center font-display text-6xl text-pine">🎁 {giftee.name}</p>
            <div className="mt-6">
              <h2 className="mb-3 font-bold">Списъкът с желания на {giftee.name}</h2>
              {giftee.wishes.length >= MIN_WISHES ? (
                <WishList items={giftee.wishes} />
              ) : (
                <p className="rounded-xl bg-cream px-4 py-3 text-muted">
                  {giftee.name} все още не е написал(а) списъка си. Провери отново по-късно на същия линк.
                </p>
              )}
            </div>
            <p className="mt-4 text-center text-sm text-muted">🤫 Шшт! Пази тайната.</p>
          </section>
        ) : (
          <section className="card relative overflow-hidden border-2 border-dashed border-gold text-center">
            <p className="text-5xl">🔒</p>
            <h2 className="mt-2 font-display text-3xl text-berry">На кого ще подаряваш?</h2>
            <p className="mx-auto mt-1 max-w-sm text-muted">
              Попълни поне 3 желания по-долу и името ще се появи точно тук.
            </p>
          </section>
        )}

        <WishlistSection
          token={token}
          initial={myWishes.map((w) => ({ title: w.title, url: w.url ?? "", description: w.description ?? "" }))}
        />
      </div>
    </PageShell>
  );
}
