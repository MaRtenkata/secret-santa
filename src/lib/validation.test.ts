import { describe, expect, it } from "vitest";
import { wishlistItemSchema } from "./validation";

describe("wishlistItemSchema", () => {
  it("accepts a title with no link or description", () => {
    expect(wishlistItemSchema.parse({ title: "Чорапи", url: "", description: "" })).toEqual({
      title: "Чорапи",
      url: null,
      description: null,
    });
  });

  it("adds https:// to links typed without it", () => {
    expect(wishlistItemSchema.parse({ title: "x", url: "www.emag.bg/item", description: "" }).url).toBe(
      "https://www.emag.bg/item",
    );
  });

  it("rejects a missing title and nonsense links", () => {
    expect(wishlistItemSchema.safeParse({ title: " ", url: "", description: "" }).success).toBe(false);
    expect(wishlistItemSchema.safeParse({ title: "x", url: "hello", description: "" }).success).toBe(false);
  });
});

describe("wishlistSchema", () => {
  const wish = (title: string) => ({ title, url: "", description: "" });
  it("needs at least 3 and allows up to 10 wishes", async () => {
    const { wishlistSchema } = await import("./validation");
    expect(wishlistSchema.safeParse([wish("a"), wish("b")]).success).toBe(false);
    expect(wishlistSchema.safeParse(["a", "b", "c"].map(wish)).success).toBe(true);
    expect(wishlistSchema.safeParse(Array.from({ length: 10 }, (_, i) => wish(`w${i}`))).success).toBe(true);
    expect(wishlistSchema.safeParse(Array.from({ length: 11 }, (_, i) => wish(`w${i}`))).success).toBe(false);
  });
});
