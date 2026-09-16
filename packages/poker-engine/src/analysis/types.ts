import type { Card } from "../types.js";
import type { Range } from "../range/types.js";
import type { PotOdds } from "../pot-odds.js";
import type { ExpectedValue } from "../ev.js";

export type AnalysisDecision =
  | "profitable"
  | "unprofitable"
  | "break_even";

export interface HandAnalysisInput {
  heroCards: Card[];
  villainRange: Range;
  board: Card[];

  pot: number;
  callAmount: number;

  iterationsPerCombo?: number;
}

export interface HandAnalysisResult {
  equity: number;

  potOdds: PotOdds;

  expectedValue: ExpectedValue;

  decision: AnalysisDecision;

  validVillainCombos: number;
}