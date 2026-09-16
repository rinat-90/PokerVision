import type {
  DecisionAnalysisResult,
  Range
} from "@poker-vision/poker-engine";

import {
  analyzeDecisionPoint
} from "./analyze-decision-point.js";

import {
  findDecisionPoints
} from "./decision-points.js";

import type {
  DecisionContext
} from "./decision-context.js";

import type {
  HandHistory
} from "./types.js";

export interface HandDecisionAnalysis {
  actionIndex: number;
  action: DecisionContext["targetAction"];
  context: DecisionContext;
  analysis: DecisionAnalysisResult;
}

export interface AnalyzeHandHistoryOptions {
  heroPlayerId: string;
  villainRange: Range;
  iterationsPerCombo?: number;
  foldProbability?: number;
}

export interface HandHistoryAnalysisSummary {
  totalDecisionPoints: number;
  analyzedDecisionPoints: number;
  callDecisions: number;
}

export interface HandHistoryAnalysis {
  handId: string;
  summary: HandHistoryAnalysisSummary;
  decisions: HandDecisionAnalysis[];
}

export function analyzeHandHistory(
  hand: HandHistory,
  options: AnalyzeHandHistoryOptions
): HandHistoryAnalysis {
  const decisions: HandDecisionAnalysis[] = [];

  const decisionPoints =
    findDecisionPoints(
      hand,
      {
        playerId:
        options.heroPlayerId
      }
    );

  let callDecisions = 0;

  for (
    const decisionPoint of decisionPoints
    ) {
    if (
      decisionPoint.action.type ===
      "call"
    ) {
      callDecisions += 1;
    }

    if (
      decisionPoint.action.type !==
      "call" &&
      decisionPoint.action.type !==
      "bet" &&
      decisionPoint.action.type !==
      "raise"
    ) {
      continue;
    }

    if (
      (
        decisionPoint.action.type ===
        "bet" ||
        decisionPoint.action.type ===
        "raise"
      ) &&
      options.foldProbability ===
      undefined
    ) {
      continue;
    }

    const result =
      analyzeDecisionPoint(
        hand,
        decisionPoint.actionIndex,
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

    decisions.push({
      actionIndex:
      decisionPoint.actionIndex,

      action:
      result.context.targetAction,

      context:
      result.context,

      analysis:
      result.analysis
    });
  }

  const totalDecisionPoints =
    decisionPoints.length;

  const analyzedDecisionPoints =
    decisions.length;

  return {
    handId:
    hand.id,

    summary: {
      totalDecisionPoints,
      analyzedDecisionPoints,
      callDecisions
    },

    decisions
  };
}