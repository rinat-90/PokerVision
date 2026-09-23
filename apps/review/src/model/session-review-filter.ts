import type {
  DecisionReviewStateMap,
} from "./decision-review-state";

import {
  getDecisionReviewState,
} from "./decision-review-state";

import type {
  SessionDecision,
} from "./session-decisions";

export type SessionReviewFilter =
  | "all"
  | "unreviewed"
  | "reviewed";

export function filterSessionDecisionsByReview(
  decisions: SessionDecision[],
  states: DecisionReviewStateMap,
  filter: SessionReviewFilter,
): SessionDecision[] {
  if (filter === "all") {
    return decisions;
  }

  const reviewed =
    filter === "reviewed";

  return decisions.filter(
    (decision) =>
      getDecisionReviewState(
        states,
        decision,
      ).reviewed === reviewed,
  );
}