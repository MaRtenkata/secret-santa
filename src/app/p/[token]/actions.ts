"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, participants, wishlistItems } from "@/db";
import { firstError, wishlistSchema } from "@/lib/validation";

export type WishlistState = { error?: string; saved?: boolean } | undefined;

export async function saveWishlist(token: string, _: WishlistState, formData: FormData): Promise<WishlistState> {
  const p = (await db().select().from(participants).where(eq(participants.token, token)))[0];
  if (!p) return { error: "This link doesn't match anyone. Check the link in your email." };

  const parsed = wishlistSchema.safeParse(
    [1, 2, 3].map((n) => ({
      title: String(formData.get(`title${n}`) ?? ""),
      url: String(formData.get(`url${n}`) ?? ""),
      description: String(formData.get(`description${n}`) ?? ""),
    })),
  );
  if (!parsed.success) return { error: firstError(parsed.error) };

  await db().batch([
    db().delete(wishlistItems).where(eq(wishlistItems.participantId, p.id)),
    db()
      .insert(wishlistItems)
      .values(parsed.data.map((item, i) => ({ participantId: p.id, position: i + 1, ...item }))),
  ]);

  revalidatePath(`/p/${token}`);
  return { saved: true };
}
