import type {
  DecisionReviewStateMap,
} from "./decision-review-state";

import {
  getDecisionReviewState,
} from "./decision-review-state";

import type {
  SessionDecision,
} from "./session-decisions";

export interface SessionReviewCompletion {
  totalDecisions: number;
  reviewedDecisions: number;
  remainingDecisions: number;
  progress: number;
}

export function createSessionReviewCompletion(
  decisions: SessionDecision[],
  states: DecisionReviewStateMap,
): SessionReviewCompletion {
  const reviewedDecisions =
    decisions.reduce(
      (count, decision) =>
        count +
        (getDecisionReviewState(
          states,
          decision,
        ).reviewed
          ? 1
          : 0),
      0,
    );

  const totalDecisions =
    decisions.length;

  const remainingDecisions =
    totalDecisions -
    reviewedDecisions;

  const progress =
    totalDecisions === 0
      ? 0
      : (reviewedDecisions /
        totalDecisions) *
      100;

  return {
    totalDecisions,
    reviewedDecisions,
    remainingDecisions,
    progress,
  };
}

export function getNextUnreviewedDecision(
  decisions: SessionDecision[],
  states: DecisionReviewStateMap,
  currentDecision:
    | SessionDecision
    | null,
): SessionDecision | null {
  if (decisions.length === 0) {
    return null;
  }

  const currentIndex =
    currentDecision === null
      ? -1
      : decisions.findIndex(
        (decision) =>
          decision.handId ===
          currentDecision.handId &&
          decision.decision
            .actionIndex ===
          currentDecision.decision
            .actionIndex,
      );

  for (
    let offset = 1;
    offset <= decisions.length;
    offset += 1
  ) {
    const index =
      (currentIndex + offset) %
      decisions.length;

    const decision =
      decisions[index];

    if (
      !getDecisionReviewState(
        states,
        decision,
      ).reviewed
    ) {
      return decision;
    }
  }

  return null;
}