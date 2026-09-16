import type {
  DecisionAnalysisResult,
  Range
} from "@poker-vision/poker-engine";

import {
  analyzeDecision as analyzeEngineDecision
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
): DecisionAnalysisResult {
  return analyzeEngineDecision({
    action: context.targetAction.type,
    heroCards: context.heroCards,
    villainRange: options.villainRange,
    board: context.board,
    pot: context.pot,
    ...(context.callAmount !== undefined
      ? {
        callAmount:
        context.callAmount
      }
      : {}),
  });
}