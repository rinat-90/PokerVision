import type { Card } from "../types.js";
import type { Range } from "../range/types.js";
import { simulateEquity } from "./simulation.js";

export interface RangeEquityInput {
  heroCards: Card[];
  villainRange: Range;
  board: Card[];
  iterationsPerCombo?: number;
}

export interface RangeEquityResult {
  equity: number;
  wins: number;
  losses: number;
  ties: number;
  total: number;
  combos: number;
}

export function calculateRangeEquity(
  input: RangeEquityInput
): RangeEquityResult {
  const {
    heroCards,
    villainRange,
    board,
    iterationsPerCombo = 1_000
  } = input;

  let totalWins = 0;
  let totalLosses = 0;
  let totalTies = 0;
  let totalWeight = 0;

  for (const combo of villainRange.combos) {
    if (
      sharesCard(heroCards, combo.cards) ||
      sharesCard(board, combo.cards)
    ) {
      continue;
    }

    const result = simulateEquity({
      heroCards,
      villainCards: combo.cards,
      board,
      iterations: iterationsPerCombo
    });

    const weight = combo.weight;

    totalWins += result.wins * weight;
    totalLosses += result.losses * weight;
    totalTies += result.ties * weight;

    totalWeight +=
      result.total * weight;
  }

  if (totalWeight === 0) {
    throw new Error(
      "No valid villain combinations remain"
    );
  }

  const equity =
    (totalWins + totalTies * 0.5) /
    totalWeight;

  return {
    equity,
    wins: totalWins,
    losses: totalLosses,
    ties: totalTies,
    total: totalWeight,
    combos: villainRange.combos.filter(
      (combo) =>
        !sharesCard(heroCards, combo.cards) &&
        !sharesCard(board, combo.cards)
    ).length
  };
}

function sharesCard(
  knownCards: Card[],
  combo: [Card, Card]
): boolean {
  return combo.some((comboCard) =>
    knownCards.some(
      (knownCard) =>
        knownCard.rank === comboCard.rank &&
        knownCard.suit === comboCard.suit
    )
  );
}