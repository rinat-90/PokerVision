import type {
  Card,
} from "@poker-vision/poker-engine";

import type {
  HandReview,
} from "@poker-vision/hand-review";

import {
  getShowdownTableState,
} from "./showdown-table-state";

export interface HandResultPlayer {
  playerId: string;
  name: string;
  cards?: [Card, Card];
  payout: number;
  contribution: number;
  netResult: number;
  isWinner: boolean;
}

export interface HandResult {
  finalPot: number;
  board: Card[];
  players: HandResultPlayer[];
  winners: HandResultPlayer[];
}

export function createHandResult(
  review: HandReview,
): HandResult | undefined {
  if (review.showdown === undefined) {
    return undefined;
  }

  const showdownState =
    getShowdownTableState(review);

  if (showdownState === undefined) {
    return undefined;
  }

  const finalStreet =
    review.streets.at(-1);

  const board =
    finalStreet?.board.map(
      (card) => ({
        ...card,
      }),
    ) ?? [];

  const players =
    review.players.map(
      (player) => {
        const shownPlayer =
          review.showdown?.players.find(
            (candidate) =>
              candidate.playerId ===
              player.id,
          );

        const payout =
          review.showdown?.payouts.find(
            (candidate) =>
              candidate.playerId ===
              player.id,
          )?.amount ?? 0;

        const contribution =
          showdownState
            .totalContributions[
            player.id
            ] ?? 0;

        const netResult =
          payout - contribution;

        return {
          playerId: player.id,

          name: player.name,

          ...(shownPlayer === undefined
            ? {}
            : {
              cards: [
                {
                  ...shownPlayer.cards[0],
                },
                {
                  ...shownPlayer.cards[1],
                },
              ] as [Card, Card],
            }),

          payout,

          contribution,

          netResult,

          isWinner:
            payout > 0,
        };
      },
    );

  return {
    finalPot:
    showdownState.pot,

    board,

    players,

    winners:
      players.filter(
        (player) =>
          player.isWinner,
      ),
  };
}