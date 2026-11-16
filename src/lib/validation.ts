import { z } from "zod";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Моля, до ${max} символа.`)
    .transform((v) => (v === "" ? null : v));

export const participantSchema = z.object({
  name: z.string().trim().min(1, "Всеки участник трябва да има име.").max(80),
  email: z.string().trim().toLowerCase().email("Един от имейлите не изглежда правилен."),
});

export const eventSchema = z
  .object({
    name: z.string().trim().min(1, "Дай име на събитието.").max(100),
    budget: optionalText(40),
    exchangeDate: optionalText(60),
    message: optionalText(1000),
    participants: z.array(participantSchema).min(3, "Добави поне 3 участници."),
  })
  .refine((e) => new Set(e.participants.map((p) => p.email)).size === e.participants.length, {
    message: "Всеки участник трябва да има различен имейл.",
  });

export const wishlistItemSchema = z
  .object({
    title: z.string().trim().min(1, "Напиши какво е всяко желание.").max(120),
    url: z
      .string()
      .trim()
      .max(2000)
      .transform((v) => (v === "" ? null : v))
      .refine((v) => v === null || /^https?:\/\/\S+\.\S+/i.test(v), "Линковете трябва да започват с http:// или https://"),
    description: optionalText(500),
  })
  .refine((i) => i.url || i.description, { message: "Добави линк или кратко описание към всяко желание." });

export const wishlistSchema = z.array(wishlistItemSchema).length(3, "Добави точно 3 желания.");

export function firstError(err: z.ZodError) {
  return err.issues[0]?.message ?? "Нещо във формата не е наред.";
}
