import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db, events, participants, wishlistItems } from "@/db";

/** Number of wishlist items per participant id. */
export async function wishlistCounts(participantIds: string[]) {
  const counts = new Map<string, number>();
  if (!participantIds.length) return counts;
  const rows = await db()
    .select({ pid: wishlistItems.participantId })
    .from(wishlistItems)
    .where(inArray(wishlistItems.participantId, participantIds));
  for (const r of rows) counts.set(r.pid, (counts.get(r.pid) ?? 0) + 1);
  return counts;
}

export async function listEvents() {
  const all = await db().select().from(events).orderBy(desc(events.createdAt));
  const people = all.length
    ? await db()
        .select({ id: participants.id, eventId: participants.eventId })
        .from(participants)
        .where(
          inArray(
            participants.eventId,
            all.map((e) => e.id),
          ),
        )
    : [];
  const counts = await wishlistCounts(people.map((p) => p.id));
  return all.map((e) => {
    const mine = people.filter((p) => p.eventId === e.id);
    return { ...e, total: mine.length, done: mine.filter((p) => (counts.get(p.id) ?? 0) >= 3).length };
  });
}

export async function getEventWithPeople(eventId: string) {
  const event = (await db().select().from(events).where(eq(events.id, eventId)))[0];
  if (!event) return null;
  const people = await db()
    .select()
    .from(participants)
    .where(eq(participants.eventId, eventId))
    .orderBy(asc(participants.name));
  const counts = await wishlistCounts(people.map((p) => p.id));
  return { event, people: people.map((p) => ({ ...p, wishCount: counts.get(p.id) ?? 0 })) };
}

export async function getWishlist(participantId: string) {
  return db()
    .select()
    .from(wishlistItems)
    .where(eq(wishlistItems.participantId, participantId))
    .orderBy(asc(wishlistItems.position));
}
