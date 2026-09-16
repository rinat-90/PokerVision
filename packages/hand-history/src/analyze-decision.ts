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
  foldProbability?: number;
}

export function analyzeDecision(
  context: DecisionContext,
  options: AnalyzeDecisionOptions
): DecisionAnalysisResult {
  return analyzeEngineDecision({
    action:
    context.targetAction.type,

    heroCards:
    context.heroCards,

    villainRange:
    options.villainRange,

    board:
    context.board,

    pot:
    context.pot,

    ...(context.targetAction.type === "call" &&
    context.callAmount !== undefined
      ? {
        callAmount:
        context.callAmount
      }
      : {}),

    ...(context.targetAction.type === "bet"
      ? {
        betAmount:
        context.targetAction.amount
      }
      : {}),

    ...(context.targetAction.type === "raise" &&
    context.raiseAmount !== undefined
      ? {
        raiseAmount:
        context.raiseAmount
      }
      : {}),

    ...(context.targetAction.type === "raise" &&
    context.opponentCallAmount !== undefined
      ? {
        opponentCallAmount:
        context.opponentCallAmount
      }
      : {}),

    ...(options.foldProbability !== undefined
      ? {
        foldProbability:
        options.foldProbability
      }
      : {}),

    ...(options.iterationsPerCombo !== undefined
      ? {
        iterationsPerCombo:
        options.iterationsPerCombo
      }
      : {})
  });
}