import { RANKS, SUITS, type Card } from "./types.js";

export function createDeck(): Card[] {
  return SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      rank,
      suit
    }))
  );
}