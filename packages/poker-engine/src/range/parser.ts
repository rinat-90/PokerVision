import { RANKS, type Rank } from "../types.js";
import {
  generateAllCombos
} from "./combinations.js";

import type {
  RangeCombo
} from "./types.js";

const rankSet = new Set<string>(RANKS);

export function parseHandNotation(
  notation: string
): RangeCombo[] {
  const normalized =
    notation.trim().toUpperCase();

  if (
    normalized.length < 2 ||
    normalized.length > 3
  ) {
    throw new Error(
      `Invalid hand notation: ${notation}`
    );
  }

  const firstRank =
    normalized[0] as Rank;

  const secondRank =
    normalized[1] as Rank;

  if (
    !rankSet.has(firstRank) ||
    !rankSet.has(secondRank)
  ) {
    throw new Error(
      `Invalid ranks: ${notation}`
    );
  }

  if (firstRank === secondRank) {
    return generateAllCombos(
      firstRank,
      secondRank,
      null
    );
  }

  const suffix =
    normalized[2];

  if (
    suffix !== undefined &&
    suffix !== "S" &&
    suffix !== "O"
  ) {
    throw new Error(
      `Invalid suitedness: ${notation}`
    );
  }

  const suited =
    suffix === undefined
      ? null
      : suffix === "S";

  return generateAllCombos(
    firstRank,
    secondRank,
    suited
  );
}