import { describe, expect, it } from "vitest";
import { drawNames } from "./draw";

describe("drawNames", () => {
  it("rejects fewer than 3 people", () => {
    expect(() => drawNames(["a", "b"])).toThrow();
  });

  it("rejects duplicate ids", () => {
    expect(() => drawNames(["a", "b", "a"])).toThrow();
  });

  it("forms a valid single gift circle for 3..50 people", () => {
    for (let n = 3; n <= 50; n++) {
      for (let run = 0; run < 20; run++) {
        const ids = Array.from({ length: n }, (_, i) => `p${i}`);
        const pairs = drawNames(ids);

        expect(pairs.size).toBe(n);
        const receivers = new Set(pairs.values());
        expect(receivers.size).toBe(n);
        for (const [giver, receiver] of pairs) {
          expect(giver).not.toBe(receiver);
          expect(ids).toContain(receiver);
        }

        // Following the chain from anyone visits everyone once.
        const seen = new Set<string>();
        let cur = ids[0];
        while (!seen.has(cur)) {
          seen.add(cur);
          cur = pairs.get(cur)!;
        }
        expect(seen.size).toBe(n);
      }
    }
  });
});
