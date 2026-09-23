import type {
  DecisionReviewStateMap,
} from "./decision-review-state";

import {
  getDecisionReviewState,
} from "./decision-review-state";

import {
  createReviewSessionSummary,
} from "./review-session-summary";

import type {
  ReviewSession,
} from "./review-session";

import {
  getSessionDecisions,
} from "./session-decisions";

import {
  createSessionResults,
} from "./session-results";

export interface SessionReviewExportDecision {
  handId: string;
  actionIndex: number;
  street: string;
  action: string;
  reviewed: boolean;
  note: string;
}

export interface SessionReviewExport {
  version: 1;
  exportedAt: string;

  summary: ReturnType<
    typeof createReviewSessionSummary
  >;

  results: ReturnType<
    typeof createSessionResults
  >;

  decisions: SessionReviewExportDecision[];

  hands: ReviewSession["hands"];
}

export function createSessionReviewExport(
  session: ReviewSession,
  states: DecisionReviewStateMap,
  exportedAt: string,
): SessionReviewExport {
  const decisions =
    getSessionDecisions(session);

  return {
    version: 1,
    exportedAt,

    summary:
      createReviewSessionSummary(
        session,
      ),

    results:
      createSessionResults(
        session,
      ),

    decisions:
      decisions.map(
        (sessionDecision) => {
          const {
            handId,
            decision,
          } = sessionDecision;

          const reviewState =
            getDecisionReviewState(
              states,
              sessionDecision,
            );

          return {
            handId,
            actionIndex:
            decision.actionIndex,
            street:
            decision.street,
            action:
            decision.action,
            reviewed:
            reviewState.reviewed,
            note:
            reviewState.note,
          };
        },
      ),

    hands: session.hands,
  };
}

export function serializeSessionReviewExport(
  reviewExport: SessionReviewExport,
): string {
  return JSON.stringify(
    reviewExport,
    null,
    2,
  );
}