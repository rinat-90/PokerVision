import type {
  DecisionAnalysisResult,
  Range
} from "@poker-vision/poker-engine";

import {
  analyzeDecision as analyzeEngineDecision
} from "@poker-vision/poker-engine";

import {
  analyzeFold
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
  if (
    context.targetAction.type ===
    "fold"
  ) {
    const result =
      analyzeFold();

    return {
      action:
      result.action,

      equity:
        0,

      expectedValue:
      result.expectedValue,

      decision:
      result.decision,

      validVillainCombos:
        0
    };
  }

  const opponent =
    context.opponentContext.opponents[0];

  if (opponent === undefined) {
    throw new Error(
      "No active opponent found for decision analysis"
    );
  }

  const villainRange =
    opponent.opponent.range;

  const foldProbability =
    options.foldProbability ??
    opponent.response.foldProbability;

  return analyzeEngineDecision({
    action:
    context.targetAction.type,

    heroCards:
    context.heroCards,

    villainRange,

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

    ...(context.targetAction.type === "all_in"
      ? {
        allInAmount:
        context.targetAction.amount
      }
      : {}),

    ...((
      context.targetAction.type === "raise" ||
      context.targetAction.type === "all_in"
    ) &&
    context.opponentCallAmount !== undefined
      ? {
        opponentCallAmount:
        context.opponentCallAmount
      }
      : {}),

    ...(context.targetAction.type === "bet" ||
    context.targetAction.type === "raise" ||
    context.targetAction.type === "all_in"
      ? {
        foldProbability
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