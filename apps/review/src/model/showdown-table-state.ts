import type {
  HandReview,
  HandReviewDecisionState
} from "@poker-vision/hand-review";

import {
  getDisplayedTableState
} from "./displayed-table-state";

export interface ShowdownTablePlayer {
  id: string;
  stack: number;
  status: "active" | "folded" | "all_in" | "out";
}

export interface ShowdownTableState {
  pot: number;

  players: ShowdownTablePlayer[];

  playerContributions:
    Record<string, number>;
}

export function getShowdownTableState(
  review: HandReview
): ShowdownTableState | undefined {
  if (review.showdown === undefined) {
    return undefined;
  }

  const actions =
    review.streets.flatMap(
      street => street.actions
    );

  const lastAction =
    actions.at(-1);

  if (lastAction === undefined) {
    return undefined;
  }

  const displayed =
    getDisplayedTableState(
      lastAction.state,
      lastAction
    );

  return {
    pot: displayed.pot,

    players:
      displayed.players.map(
        player => ({
          id: player.id,
          stack: player.stack,
          status: player.status
        })
      ),

    playerContributions: {
      ...displayed.playerContributions
    }
  };
}