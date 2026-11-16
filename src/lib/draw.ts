import { randomInt } from "node:crypto";

/**
 * Shuffles the people into one random gift circle: each person gives to the
 * next one in the shuffled order and the last gives to the first.
 * Nobody draws themselves and everyone gives and receives exactly once.
 * Returns a map of giverId -> receiverId.
 */
export function drawNames(ids: string[]): Map<string, string> {
  if (ids.length < 3) throw new Error("Secret Santa needs at least 3 people.");
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate participant ids.");

  const order = [...ids];
  for (let i = order.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }

  const pairs = new Map<string, string>();
  order.forEach((giver, i) => pairs.set(giver, order[(i + 1) % order.length]));
  return pairs;
}
