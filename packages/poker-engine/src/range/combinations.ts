import {
  RANKS,
  SUITS,
  type Card,
  type Rank,
  type Suit
} from "../types.js";

import type {
  RangeCombo
} from "./types.js";

const SUIT_VALUES = [...SUITS];

export function generatePocketPairs(
  rank: Rank
): RangeCombo[] {
  const combos: RangeCombo[] = [];

  for (let i = 0; i < SUIT_VALUES.length; i++) {
    for (
      let j = i + 1;
      j < SUIT_VALUES.length;
      j++
    ) {
      combos.push({
        cards: [
          {
            rank,
            suit: SUIT_VALUES[i]!
          },
          {
            rank,
            suit: SUIT_VALUES[j]!
          }
        ],
        weight: 1
      });
    }
  }

  return combos;
}

export function generateNonPair(
  firstRank: Rank,
  secondRank: Rank,
  suited: boolean | null
): RangeCombo[] {
  const combos: RangeCombo[] = [];

  for (const firstSuit of SUIT_VALUES) {
    for (const secondSuit of SUIT_VALUES) {
      if (
        firstRank === secondRank
      ) {
        continue;
      }

      const isSuited =
        firstSuit === secondSuit;

      if (
        suited !== null &&
        isSuited !== suited
      ) {
        continue;
      }

      combos.push({
        cards: [
          {
            rank: firstRank,
            suit: firstSuit
          },
          {
            rank: secondRank,
            suit: secondSuit
          }
        ],
        weight: 1
      });
    }
  }

  return combos;
}

export function generateAllCombos(
  rank1: Rank,
  rank2: Rank,
  suited: boolean | null
): RangeCombo[] {
  if (rank1 === rank2) {
    return generatePocketPairs(rank1);
  }

  return generateNonPair(
    rank1,
    rank2,
    suited
  );
}