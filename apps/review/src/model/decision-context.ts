import type {
  HandReview,
  HandReviewPlayer,
} from "@poker-vision/hand-review";

import type {
  SessionDecision,
} from "./session-decisions";

export interface DecisionContext {
  player?: HandReviewPlayer;
  playerId?: string;
}

export function getDecisionContext(
  value: SessionDecision,
  review: HandReview,
): DecisionContext {
  const action =
    review.streets
      .flatMap(
        (street) =>
          street.actions,
      )
      .find(
        (candidate) =>
          candidate.actionIndex ===
          value.decision.actionIndex,
      );

  if (action === undefined) {
    return {};
  }

  const player =
    review.players.find(
      (candidate) =>
        candidate.id ===
        action.playerId,
    );

  return {
    playerId: action.playerId,
    player,
  };
}