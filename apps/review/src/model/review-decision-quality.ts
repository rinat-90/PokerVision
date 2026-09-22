import type {
  ReviewSession,
} from "./review-session";

export interface ReviewDecisionQuality {
  analyzedDecisions: number;
  positiveEvDecisions: number;
  negativeEvDecisions: number;
  neutralEvDecisions: number;
  totalExpectedValue: number;
  averageExpectedValue: number | null;
}

export function createReviewDecisionQuality(
  session: ReviewSession,
): ReviewDecisionQuality {
  let analyzedDecisions = 0;
  let positiveEvDecisions = 0;
  let negativeEvDecisions = 0;
  let neutralEvDecisions = 0;
  let totalExpectedValue = 0;

  for (const hand of session.hands) {
    for (const decision of hand.decisions) {
      if (
        decision.status !== "analyzed" ||
        decision.expectedValue === undefined
      ) {
        continue;
      }

      analyzedDecisions += 1;
      totalExpectedValue +=
        decision.expectedValue;

      if (decision.expectedValue > 0) {
        positiveEvDecisions += 1;
      } else if (
        decision.expectedValue < 0
      ) {
        negativeEvDecisions += 1;
      } else {
        neutralEvDecisions += 1;
      }
    }
  }

  return {
    analyzedDecisions,
    positiveEvDecisions,
    negativeEvDecisions,
    neutralEvDecisions,
    totalExpectedValue,
    averageExpectedValue:
      analyzedDecisions === 0
        ? null
        : totalExpectedValue /
        analyzedDecisions,
  };
}