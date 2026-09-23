import type {
  DecisionReviewStateMap,
} from "./decision-review-state";

import {
  getDecisionReviewState,
} from "./decision-review-state";

import type {
  SessionDecision,
} from "./session-decisions";

export interface SessionReviewNote {
  handId: string;
  decision: SessionDecision["decision"];
  note: string;
}

export function createSessionReviewNotes(
  decisions: SessionDecision[],
  states: DecisionReviewStateMap,
): SessionReviewNote[] {
  return decisions.flatMap(
    (decision) => {
      const state =
        getDecisionReviewState(
          states,
          decision,
        );

      const note = state.note.trim();

      if (note.length === 0) {
        return [];
      }

      return [
        {
          handId: decision.handId,
          decision:
          decision.decision,
          note,
        },
      ];
    },
  );
}