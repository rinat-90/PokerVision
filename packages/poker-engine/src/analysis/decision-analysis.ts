import type { Card } from "../types.js";
import type { Range } from "../range/types.js";

export type DecisionAction =
  | "fold"
  | "check"
  | "call"
  | "bet"
  | "raise"
  | "all_in";

export type DecisionClassification =
  | "profitable"
  | "unprofitable"
  | "break_even"
  | "not_applicable";

export interface DecisionAnalysisInput {
  action: DecisionAction;
  heroCards: Card[];
  villainRange: Range;
  board: Card[];
  pot: number;
  callAmount?: number;
  betAmount?: number;
  raiseAmount?: number;
  effectiveStack?: number;
  iterationsPerCombo?: number;
}

export interface DecisionAnalysisResult {
  action: DecisionAction;
  equity: number;
  expectedValue?: number;
  potOdds?: number;
  decision: DecisionClassification;
  validVillainCombos: number;
}