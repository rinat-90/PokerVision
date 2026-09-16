import { describe, expect, it } from "vitest";
import { createDeck } from "./deck.js";

describe("createDeck", () => {
  it("creates a standard 52-card deck", () => {
    const deck = createDeck();

    expect(deck).toHaveLength(52);
  });

  it("contains unique cards", () => {
    const deck = createDeck();

    const cards = deck.map(
      (card) => `${card.rank}-${card.suit}`
    );

    expect(new Set(cards).size).toBe(52);
  });
});