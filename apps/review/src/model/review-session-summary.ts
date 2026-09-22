import type {
  ReviewSession,
} from "./review-session";

import {
  createHandResult,
} from "./hand-result";

export interface ReviewSessionSummary {
  totalHands: number;
  totalDecisionPoints: number;
  analyzedDecisionPoints: number;
  skippedDecisionPoints: number;
  callDecisions: number;

  completedHands: number;
  totalNetResult: number;
}

export function createReviewSessionSummary(
  session: ReviewSession,
): ReviewSessionSummary {
  return session.hands.reduce<ReviewSessionSummary>(
    (summary, hand) => {
      const result =
        createHandResult(hand);

      const heroResult =
        result?.players.find(
          (player) =>
            player.playerId ===
            hand.heroPlayerId,
        );

      return {
        totalHands:
          summary.totalHands + 1,

        totalDecisionPoints:
          summary.totalDecisionPoints +
          hand.summary.totalDecisionPoints,

        analyzedDecisionPoints:
          summary.analyzedDecisionPoints +
          hand.summary.analyzedDecisionPoints,

        skippedDecisionPoints:
          summary.skippedDecisionPoints +
          hand.summary.skippedDecisionPoints,

        callDecisions:
          summary.callDecisions +
          hand.summary.callDecisions,

        completedHands:
          summary.completedHands +
          (heroResult === undefined
            ? 0
            : 1),

        totalNetResult:
          summary.totalNetResult +
          (heroResult?.netResult ?? 0),
      };
    },
    {
      totalHands: 0,
      totalDecisionPoints: 0,
      analyzedDecisionPoints: 0,
      skippedDecisionPoints: 0,
      callDecisions: 0,
      completedHands: 0,
      totalNetResult: 0,
    },
  );
}