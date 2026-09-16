import type {
  DecisionAnalysisResult,
  Range
} from "@poker-vision/poker-engine";

import {
  analyzeDecision
} from "./analyze-decision.js";

import {
  createDecisionContext
} from "./decision-context.js";

import {
  replayHandToAction
} from "./replay-hand.js";

import type {
  DecisionContext
} from "./decision-context.js";

import type {
  HandHistory
} from "./types.js";

export interface AnalyzeDecisionPointOptions {
  villainRange: Range;
  iterationsPerCombo?: number;
  foldProbability?: number;
}

export interface DecisionPointAnalysis {
  context: DecisionContext;
  analysis: DecisionAnalysisResult;
}

export function analyzeDecisionPoint(
  hand: HandHistory,
  actionIndex: number,
  options: AnalyzeDecisionPointOptions
): DecisionPointAnalysis {
  const snapshot =
    replayHandToAction(
      hand,
      actionIndex
    );

  const context =
    createDecisionContext(
      snapshot
    );

  const analysis =
    analyzeDecision(
      context,
      {
        villainRange:
        options.villainRange,

        ...(options.iterationsPerCombo !== undefined
          ? {
            iterationsPerCombo:
            options.iterationsPerCombo
          }
          : {}),

        ...(options.foldProbability !== undefined
          ? {
            foldProbability:
            options.foldProbability
          }
          : {})
      }
    );

  return {
    context,
    analysis
  };
}