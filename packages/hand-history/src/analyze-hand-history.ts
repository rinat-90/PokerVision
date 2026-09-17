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

export type DecisionAnalysisStatus =
  | "analyzed"
  | "skipped";

export type DecisionSkipReason =
  | "action_not_supported"
  | "fold_probability_required";

export interface HandDecisionAnalysis {
  actionIndex: number;
  action: DecisionContext["targetAction"];
  context: DecisionContext;
  status: DecisionAnalysisStatus;
  skipReason?: DecisionSkipReason;
  analysis?: DecisionAnalysisResult;
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
  skippedDecisionPoints: number;
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
    const action =
      decisionPoint.action;

    if (
      action.type === "call"
    ) {
      callDecisions += 1;
    }

    const snapshot =
      replayHandToAction(
        hand,
        decisionPoint.actionIndex
      );

    const context =
      createDecisionContext(
        snapshot,
        {
          villainRange:
          options.villainRange
        }
      );

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
      context.targetAction,

      context,

      status:
        "analyzed",

      analysis:
      result.analysis
    });
  }

  const totalDecisionPoints =
    decisionPoints.length;

  const analyzedDecisionPoints =
    decisions.filter(
      (decision) =>
        decision.status ===
        "analyzed"
    ).length;

  const skippedDecisionPoints =
    decisions.filter(
      (decision) =>
        decision.status ===
        "skipped"
    ).length;

  return {
    handId:
    hand.id,

    summary: {
      totalDecisionPoints,

      analyzedDecisionPoints,

      skippedDecisionPoints,

      callDecisions
    },

    decisions
  };
}