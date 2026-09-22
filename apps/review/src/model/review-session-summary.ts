import type {
  ReviewSession,
} from "./review-session";

export interface ReviewSessionSummary {
  totalHands: number;
  totalDecisionPoints: number;
  analyzedDecisionPoints: number;
  skippedDecisionPoints: number;
  callDecisions: number;
}

export function createReviewSessionSummary(
  session: ReviewSession,
): ReviewSessionSummary {
  return session.hands.reduce<ReviewSessionSummary>(
    (summary, hand) => ({
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
    }),
    {
      totalHands: 0,
      totalDecisionPoints: 0,
      analyzedDecisionPoints: 0,
      skippedDecisionPoints: 0,
      callDecisions: 0,
    },
  );
}