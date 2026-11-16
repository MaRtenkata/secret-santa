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
