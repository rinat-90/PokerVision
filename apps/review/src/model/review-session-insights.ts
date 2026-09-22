import type {
  ReviewSession,
} from "./review-session";

export interface ReviewSessionInsights {
  actions: Record<string, number>;
  streets: Record<string, number>;
  analyzed: number;
  skipped: number;
}

export function createReviewSessionInsights(
  session: ReviewSession,
): ReviewSessionInsights {
  const insights: ReviewSessionInsights = {
    actions: {},
    streets: {},
    analyzed: 0,
    skipped: 0,
  };

  for (const hand of session.hands) {
    for (const decision of hand.decisions) {
      insights.actions[decision.action] =
        (insights.actions[
          decision.action
          ] ?? 0) + 1;

      insights.streets[decision.street] =
        (insights.streets[
          decision.street
          ] ?? 0) + 1;

      if (
        decision.status === "analyzed"
      ) {
        insights.analyzed += 1;
      } else {
        insights.skipped += 1;
      }
    }
  }

  return insights;
}