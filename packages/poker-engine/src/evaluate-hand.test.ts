import { describe, expect, it } from "vitest";
import { evaluateHand } from "./evaluate-hand.js";
import { HandCategory } from "./hand-ranking.js";
import type { Card } from "./types.js";

const card = (
  rank: Card["rank"],
  suit: Card["suit"]
): Card => ({
  rank,
  suit
});

describe("evaluateHand", () => {
  it("detects high card", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("J", "hearts"),
      card("8", "clubs"),
      card("5", "diamonds"),
      card("2", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.HIGH_CARD
    );
  });

  it("detects one pair", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("A", "hearts"),
      card("8", "clubs"),
      card("5", "diamonds"),
      card("2", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.ONE_PAIR
    );
  });

  it("detects two pair", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("A", "hearts"),
      card("8", "clubs"),
      card("8", "diamonds"),
      card("2", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.TWO_PAIR
    );
  });

  it("detects three of a kind", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("A", "hearts"),
      card("A", "clubs"),
      card("8", "diamonds"),
      card("2", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.THREE_OF_A_KIND
    );
  });

  it("detects straight", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("K", "hearts"),
      card("Q", "clubs"),
      card("J", "diamonds"),
      card("T", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.STRAIGHT
    );
  });

  it("detects flush", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("J", "spades"),
      card("8", "spades"),
      card("5", "spades"),
      card("2", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.FLUSH
    );
  });

  it("detects full house", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("A", "hearts"),
      card("A", "clubs"),
      card("8", "diamonds"),
      card("8", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.FULL_HOUSE
    );
  });

  it("detects four of a kind", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("A", "hearts"),
      card("A", "clubs"),
      card("A", "diamonds"),
      card("8", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.FOUR_OF_A_KIND
    );
  });

  it("detects straight flush", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("K", "spades"),
      card("Q", "spades"),
      card("J", "spades"),
      card("T", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.STRAIGHT_FLUSH
    );
  });

  it("handles a five-high straight", () => {
    const result = evaluateHand([
      card("A", "spades"),
      card("2", "hearts"),
      card("3", "clubs"),
      card("4", "diamonds"),
      card("5", "spades")
    ]);

    expect(result.category).toBe(
      HandCategory.STRAIGHT
    );

    expect(result.score).toEqual([5]);
  });
});