import {
  parseHandNotation
} from "./parser.js";

import type {
  Range,
  RangeCombo
} from "./types.js";

export function createRange(
  hands: string[]
): Range {
  const combos: RangeCombo[] = [];

  for (const hand of hands) {
    combos.push(
      ...parseHandNotation(hand)
    );
  }

  return {
    combos
  };
}