import { describe, expect, it } from "vitest";
import { getBestHand } from "./best-hand.js";
import { compareHands } from "./compare-hands.js";
import type { Card } from "./types.js";

const card = (
  rank: Card["rank"],
  suit: Card["suit"]
): Card => ({
  rank,
  suit
});

describe("compareHands", () => {
  it("determines the stronger hand", () => {
    const pairOfAces = getBestHand([
      card("A", "spades"),
      card("A", "hearts"),
      card("K", "clubs"),
      card("Q", "diamonds"),
      card("J", "spades")
    ]);

    const pairOfKings = getBestHand([
      card("K", "spades"),
      card("K", "hearts"),
      card("Q", "clubs"),
      card("J", "diamonds"),
      card("T", "spades")
    ]);

    expect(
      compareHands(pairOfAces, pairOfKings)
    ).toBeGreaterThan(0);
  });

  it("detects a tie", () => {
    const handA = getBestHand([
      card("A", "spades"),
      card("K", "hearts"),
      card("Q", "clubs"),
      card("J", "diamonds"),
      card("T", "spades")
    ]);

    const handB = getBestHand([
      card("A", "clubs"),
      card("K", "diamonds"),
      card("Q", "hearts"),
      card("J", "clubs"),
      card("T", "hearts")
    ]);

    expect(compareHands(handA, handB)).toBe(0);
  });
});