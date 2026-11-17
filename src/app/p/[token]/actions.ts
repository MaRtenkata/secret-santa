"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db, events, participants, wishlistItems, type Participant } from "@/db";
import { appUrl, sendWishlistReady } from "@/lib/email";
import { firstError, MAX_WISHES, MIN_WISHES, wishlistSchema } from "@/lib/validation";

export type WishlistState = { error?: string; saved?: boolean } | undefined;

async function wishCount(participantId: string) {
  const [row] = await db()
    .select({ n: count() })
    .from(wishlistItems)
    .where(eq(wishlistItems.participantId, participantId));
  return row?.n ?? 0;
}

/** Emails whoever is buying for `giftee` that the giftee's wishlist is ready. */
async function notifyGiver(giftee: Participant) {
  try {
    const giver = (await db().select().from(participants).where(eq(participants.assignedToId, giftee.id)))[0];
    if (!giver) return;
    const event = (await db().select().from(events).where(eq(events.id, giftee.eventId)))[0];
    const giverUnlocked = (await wishCount(giver.id)) >= MIN_WISHES;
    await sendWishlistReady({
      to: giver.email,
      name: giver.name,
      eventName: event.name,
      link: `${appUrl()}/p/${giver.token}`,
      gifteeName: giverUnlocked ? giftee.name : null,
    });
  } catch (err) {
    // A failed notification shouldn't affect the person who just saved their list.
    console.error("Wishlist-ready email failed:", err);
  }
}

export async function saveWishlist(token: string, _: WishlistState, formData: FormData): Promise<WishlistState> {
  const p = (await db().select().from(participants).where(eq(participants.token, token)))[0];
  if (!p) return { error: "Този линк не е валиден. Провери линка в имейла си." };

  const parsed = wishlistSchema.safeParse(
    // Fields are numbered title1, title2, … in the order shown; collect however many were sent.
    Array.from({ length: MAX_WISHES + 1 }, (_, i) => i + 1)
      .filter((n) => formData.has(`title${n}`))
      .map((n) => ({
        title: String(formData.get(`title${n}`) ?? ""),
        url: String(formData.get(`url${n}`) ?? ""),
        description: String(formData.get(`description${n}`) ?? ""),
      })),
  );
  if (!parsed.success) return { error: firstError(parsed.error) };

  const wasComplete = (await wishCount(p.id)) >= MIN_WISHES;

  await db().batch([
    db().delete(wishlistItems).where(eq(wishlistItems.participantId, p.id)),
    db()
      .insert(wishlistItems)
      .values(parsed.data.map((item, i) => ({ participantId: p.id, position: i + 1, ...item }))),
  ]);

  // Only on the first completion, not on every later edit. Sent after the response so saving stays fast.
  if (!wasComplete) after(() => notifyGiver(p));

  revalidatePath(`/p/${token}`);
  return { saved: true };
}
