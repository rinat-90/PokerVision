import type { Card } from "./types.js";
import { getCardValue } from "./card-utils.js";

export function isFlush(cards: Card[]): boolean {
  if (cards.length !== 5) {
    return false;
  }

  return cards.every(
    (card) => card.suit === cards[0]?.suit
  );
}

export function getSortedValues(cards: Card[]): number[] {
  return [...cards]
    .map(getCardValue)
    .sort((a, b) => b - a);
}

export function getStraightHighCard(
  cards: Card[]
): number | null {
  const values = [...new Set(getSortedValues(cards))];

  if (values.length !== 5) {
    return null;
  }

  // Wheel straight: A-2-3-4-5
  if (
    values[0] === 14 &&
    values[1] === 5 &&
    values[2] === 4 &&
    values[3] === 3 &&
    values[4] === 2
  ) {
    return 5;
  }

  for (let i = 0; i < values.length - 1; i++) {
    const current = values[i];
    const next = values[i + 1];

    if (current === undefined || next === undefined) {
      return null;
    }

    if (current - next !== 1) {
      return null;
    }
  }

  return values[0] ?? null;
}

export function getRankCounts(
  cards: Card[]
): Map<number, number> {
  const counts = new Map<number, number>();

  for (const card of cards) {
    const value = getCardValue(card);

    counts.set(
      value,
      (counts.get(value) ?? 0) + 1
    );
  }

  return counts;
}