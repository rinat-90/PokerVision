import type { Card } from "./types.js";
import { RANK_VALUES } from "./card-values.js";

export function getCardValue(card: Card): number {
  return RANK_VALUES[card.rank];
}

export function sortCardsDescending(cards: Card[]): Card[] {
  return [...cards].sort(
    (a, b) => getCardValue(b) - getCardValue(a)
  );
}