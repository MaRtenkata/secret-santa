"use server";

import { randomBytes, randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, events, participants, wishlistItems, type Event, type Participant } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { drawNames } from "@/lib/draw";
import { appUrl, sendInvite } from "@/lib/email";
import { createSessionToken, passwordMatches, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { eventSchema, firstError } from "@/lib/validation";

export type FormState = { error?: string } | undefined;

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) return { error: "That password isn't right." };
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

async function emailParticipant(event: Event, p: Participant, reminder = false) {
  try {
    await sendInvite({
      to: p.email,
      name: p.name,
      eventName: event.name,
      link: `${appUrl()}/p/${p.token}`,
      budget: event.budget,
      exchangeDate: event.exchangeDate,
      message: event.message,
      reminder,
    });
    await db().update(participants).set({ emailSentAt: new Date(), emailError: null }).where(eq(participants.id, p.id));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db().update(participants).set({ emailError: msg.slice(0, 300) }).where(eq(participants.id, p.id));
  }
}

export async function createEvent(_: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  let rawParticipants: unknown;
  try {
    rawParticipants = JSON.parse(String(formData.get("participants") ?? "[]"));
  } catch {
    return { error: "Couldn't read the list of people. Please try again." };
  }

  const parsed = eventSchema.safeParse({
    name: formData.get("name") ?? "",
    budget: formData.get("budget") ?? "",
    exchangeDate: formData.get("exchangeDate") ?? "",
    message: formData.get("message") ?? "",
    participants: rawParticipants,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const data = parsed.data;

  const eventId = randomUUID();
  const people = data.participants.map((p) => ({
    id: randomUUID(),
    eventId,
    name: p.name,
    email: p.email,
    token: randomBytes(24).toString("base64url"),
  }));
  const pairs = drawNames(people.map((p) => p.id));
  const rows = people.map((p) => ({ ...p, assignedToId: pairs.get(p.id)! }));

  // One round trip, atomic: the event and its people are saved together.
  await db().batch([
    db().insert(events).values({
      id: eventId,
      name: data.name,
      budget: data.budget,
      exchangeDate: data.exchangeDate,
      message: data.message,
    }),
    db().insert(participants).values(rows),
  ]);

  const event = (await db().select().from(events).where(eq(events.id, eventId)))[0];
  const saved = await db().select().from(participants).where(eq(participants.eventId, eventId));
  for (const p of saved) await emailParticipant(event, p);

  revalidatePath("/admin");
  redirect(`/admin/events/${eventId}`);
}

export async function resendEmail(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("participantId") ?? "");
  const p = (await db().select().from(participants).where(eq(participants.id, id)))[0];
  if (!p) return;
  const event = (await db().select().from(events).where(eq(events.id, p.eventId)))[0];
  await emailParticipant(event, p);
  revalidatePath(`/admin/events/${p.eventId}`);
}

export async function remindMissingWishlists(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId") ?? "");
  const event = (await db().select().from(events).where(eq(events.id, eventId)))[0];
  if (!event) return;
  const people = await db().select().from(participants).where(eq(participants.eventId, eventId));
  const ids = people.map((p) => p.id);
  const items = ids.length
    ? await db().select({ pid: wishlistItems.participantId }).from(wishlistItems).where(inArray(wishlistItems.participantId, ids))
    : [];
  const counts = new Map<string, number>();
  for (const i of items) counts.set(i.pid, (counts.get(i.pid) ?? 0) + 1);
  for (const p of people) if ((counts.get(p.id) ?? 0) < 3) await emailParticipant(event, p, true);
  revalidatePath(`/admin/events/${eventId}`);
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const eventId = String(formData.get("eventId") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const event = (await db().select().from(events).where(eq(events.id, eventId)))[0];
  if (!event || confirm.trim() !== event.name) return;
  // Clear self-references first, then cascade removes people and wishlists.
  await db().batch([
    db().update(participants).set({ assignedToId: null }).where(eq(participants.eventId, eventId)),
    db().delete(events).where(eq(events.id, eventId)),
  ]);
  revalidatePath("/admin");
  redirect("/admin");
}
