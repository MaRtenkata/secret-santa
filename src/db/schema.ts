import {
  type AnyPgColumn,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  budget: text("budget"),
  exchangeDate: text("exchange_date"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    token: text("token").notNull(),
    assignedToId: uuid("assigned_to_id").references((): AnyPgColumn => participants.id),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    emailError: text("email_error"),
  },
  (t) => [uniqueIndex("participants_token_idx").on(t.token), index("participants_event_idx").on(t.eventId)],
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    url: text("url"),
    description: text("description"),
  },
  (t) => [uniqueIndex("wishlist_participant_position_idx").on(t.participantId, t.position)],
);

export type Event = typeof events.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type WishlistItem = typeof wishlistItems.$inferSelect;
