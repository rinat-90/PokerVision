import type {
  HandAnalysisResult,
  Range
} from "@poker-vision/poker-engine";

import {
  analyzeHand
} from "@poker-vision/poker-engine";

import type {
  DecisionContext
} from "./decision-context.js";

export interface AnalyzeDecisionOptions {
  villainRange: Range;
  iterationsPerCombo?: number;
}

export function analyzeDecision(
  context: DecisionContext,
  options: AnalyzeDecisionOptions
): HandAnalysisResult {
  return analyzeHand({
    heroCards: context.heroCards,
    villainRange: options.villainRange,
    board: context.board,
    pot: context.pot,
    callAmount: context.callAmount,
    ...(options.iterationsPerCombo !== undefined
      ? {
        iterationsPerCombo:
        options.iterationsPerCombo
      }
      : {})
  });
}