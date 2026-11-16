import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep this under ${max} characters.`)
    .transform((v) => (v === "" ? null : v));

export const participantSchema = z.object({
  name: z.string().trim().min(1, "Every person needs a name.").max(80),
  email: z.string().trim().toLowerCase().email("One of the emails doesn't look right."),
});

export const eventSchema = z
  .object({
    name: z.string().trim().min(1, "Give the event a name.").max(100),
    budget: optionalText(40),
    exchangeDate: optionalText(60),
    message: optionalText(1000),
    participants: z.array(participantSchema).min(3, "Add at least 3 people."),
  })
  .refine((e) => new Set(e.participants.map((p) => p.email)).size === e.participants.length, {
    message: "Each person needs a different email address.",
  });

export const wishlistItemSchema = z
  .object({
    title: z.string().trim().min(1, "Give each wish a name.").max(120),
    url: z
      .string()
      .trim()
      .max(2000)
      .transform((v) => (v === "" ? null : v))
      .refine((v) => v === null || /^https?:\/\/\S+\.\S+/i.test(v), "Links need to start with http:// or https://"),
    description: optionalText(500),
  })
  .refine((i) => i.url || i.description, { message: "Add a link or a short description to each wish." });

export const wishlistSchema = z.array(wishlistItemSchema).length(3, "Add exactly 3 wishes.");

export function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Something in the form isn't right.";
}
