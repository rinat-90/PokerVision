import { describe, expect, it } from "vitest";
import { getBestHand } from "./best-hand.js";
import { HandCategory } from "./hand-ranking.js";
import type { Card } from "./types.js";

const card = (
  rank: Card["rank"],
  suit: Card["suit"]
): Card => ({
  rank,
  suit
});

describe("getBestHand", () => {
  it("finds a royal flush from seven cards", () => {
    const result = getBestHand([
      card("A", "spades"),
      card("K", "spades"),
      card("Q", "spades"),
      card("J", "spades"),
      card("T", "spades"),
      card("2", "hearts"),
      card("3", "clubs")
    ]);

    expect(result.category).toBe(
      HandCategory.STRAIGHT_FLUSH
    );

    expect(result.score).toEqual([14]);
  });

  it("finds the best full house", () => {
    const result = getBestHand([
      card("A", "spades"),
      card("A", "hearts"),
      card("A", "clubs"),
      card("K", "diamonds"),
      card("K", "spades"),
      card("2", "clubs"),
      card("3", "hearts")
    ]);

    expect(result.category).toBe(
      HandCategory.FULL_HOUSE
    );

    expect(result.score).toEqual([14, 13]);
  });

  it("finds the best flush", () => {
    const result = getBestHand([
      card("A", "spades"),
      card("J", "spades"),
      card("8", "spades"),
      card("5", "spades"),
      card("2", "spades"),
      card("K", "hearts"),
      card("3", "clubs")
    ]);

    expect(result.category).toBe(
      HandCategory.FLUSH
    );

    expect(result.score).toEqual([
      14,
      11,
      8,
      5,
      2
    ]);
  });

  it("chooses the higher straight", () => {
    const result = getBestHand([
      card("A", "spades"),
      card("K", "hearts"),
      card("Q", "clubs"),
      card("J", "diamonds"),
      card("T", "spades"),
      card("9", "hearts"),
      card("2", "clubs")
    ]);

    expect(result.category).toBe(
      HandCategory.STRAIGHT
    );

    expect(result.score).toEqual([14]);
  });

  it("chooses the highest pair when multiple pairs exist", () => {
    const result = getBestHand([
      card("A", "spades"),
      card("A", "hearts"),
      card("K", "clubs"),
      card("K", "diamonds"),
      card("Q", "spades"),
      card("J", "clubs"),
      card("2", "hearts")
    ]);

    expect(result.category).toBe(
      HandCategory.TWO_PAIR
    );

    expect(result.score).toEqual([
      14,
      13,
      12
    ]);
  });

  it("uses the best five cards from seven", () => {
    const result = getBestHand([
      card("A", "spades"),
      card("A", "hearts"),
      card("A", "clubs"),
      card("A", "diamonds"),
      card("K", "spades"),
      card("Q", "hearts"),
      card("J", "clubs")
    ]);

    expect(result.category).toBe(
      HandCategory.FOUR_OF_A_KIND
    );

    expect(result.score).toEqual([
      14,
      13
    ]);
  });
});