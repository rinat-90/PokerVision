import type { Card, Rank } from "../types.js";

export interface RangeCombo {
  cards: [Card, Card];
  weight: number;
}

export interface Range {
  combos: RangeCombo[];
}

export interface RangeInput {
  hands: string[];
}