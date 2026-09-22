import type {
  HandReviewDecision,
} from "@poker-vision/hand-review";

import type {
  ReviewSession,
} from "./review-session";

import type {
  DecisionFilter,
} from "./decision-filter";

export interface SessionDecision {
  handId: string;
  decision: HandReviewDecision;
}

export function getSessionDecisions(
  session: ReviewSession,
): SessionDecision[] {
  return session.hands.flatMap(
    (hand) =>
      hand.decisions.map(
        (decision) => ({
          handId: hand.id,
          decision,
        }),
      ),
  );
}

export function filterSessionDecisions(
  decisions: SessionDecision[],
  filter: DecisionFilter,
): SessionDecision[] {
  return decisions.filter(
    ({ decision }) => {
      if (
        filter.street !== "all" &&
        decision.street !== filter.street
      ) {
        return false;
      }

      if (
        filter.action !== "all" &&
        decision.action !== filter.action
      ) {
        return false;
      }

      if (
        filter.status !== "all" &&
        decision.status !== filter.status
      ) {
        return false;
      }

      return true;
    },
  );
}