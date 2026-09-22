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
  cards: [Card, Card];
  payout: number;
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
    review.showdown.players.map(
      (shownPlayer) => {
        const player =
          review.players.find(
            (candidate) =>
              candidate.id ===
              shownPlayer.playerId,
          );

        const payout =
          review.showdown?.payouts.find(
            (candidate) =>
              candidate.playerId ===
              shownPlayer.playerId,
          )?.amount ?? 0;

        return {
          playerId:
          shownPlayer.playerId,

          name:
            player?.name ??
            shownPlayer.playerId,

          cards: [
            {
              ...shownPlayer.cards[0],
            },
            {
              ...shownPlayer.cards[1],
            },
          ] as [
            typeof shownPlayer.cards[0],
            typeof shownPlayer.cards[1],
          ],

          payout,

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