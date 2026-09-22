import {
  replayHandToAction
} from "@poker-vision/hand-history";

import type {
  AnalysisReport,
  HandHistory
} from "@poker-vision/hand-history";

import type {
  HandReview,
  HandReviewAction,
  HandReviewStreet
} from "./hand-review.js";

export function createHandReview(
  history: HandHistory,
  report: AnalysisReport
): HandReview {
  if (history.id !== report.handId) {
    throw new Error(
      `Hand ID mismatch: history=${history.id}, report=${report.handId}`
    );
  }

  let actionIndex = 0;

  const streets: HandReviewStreet[] =
    history.streets.map(
      street => {
        const actions: HandReviewAction[] =
          street.actions.map(
            action => {
              const currentActionIndex =
                actionIndex++;

              const snapshot =
                replayHandToAction(
                  history,
                  currentActionIndex
                );

              return {
                actionIndex:
                currentActionIndex,

                playerId:
                action.playerId,

                street:
                action.street,

                type:
                action.type,

                amount:
                action.amount,

                state: {
                  street:
                  snapshot.street,

                  board:
                    snapshot.board.map(
                      card => ({
                        ...card
                      })
                    ),

                  players:
                    snapshot.players.map(
                      player => ({
                        ...player
                      })
                    ),

                  pot:
                  snapshot.pot,

                  currentBet:
                  snapshot.currentBet,

                  minimumRaise:
                  snapshot.minimumRaise,

                  playerContributions: {
                    ...snapshot.playerContributions
                  },

                  totalContributions: {
                    ...snapshot.totalContributions
                  }
                }
              };
            }
          );

        return {
          street:
          street.street,

          board:
            street.board.map(
              card => ({
                ...card
              })
            ),

          actions
        };
      }
    );

  return {
    id:
    history.id,

    heroPlayerId:
    report.heroPlayerId,

    gameFormat:
    history.gameFormat,

    blinds: {
      smallBlind:
      history.smallBlind,

      bigBlind:
      history.bigBlind,

      ante:
      history.ante
    },

    players:
      history.players.map(
        player => ({
          id:
          player.id,

          name:
          player.name,

          position:
          player.position,

          startingStack:
          player.startingStack,

          ...(player.holeCards !== undefined
            ? {
              holeCards: [
                {
                  ...player.holeCards[0]
                },
                {
                  ...player.holeCards[1]
                }
              ] as [
                typeof player.holeCards[0],
                typeof player.holeCards[1]
              ]
            }
            : {})
        })
      ),

    streets,

    decisions:
      report.decisions.map(
        decision => {
          const snapshot =
            replayHandToAction(
              history,
              decision.actionIndex
            );

          return {
            ...decision,

            state: {
              street:
              snapshot.street,

              board:
                snapshot.board.map(
                  card => ({
                    ...card
                  })
                ),

              players:
                snapshot.players.map(
                  player => ({
                    ...player
                  })
                ),

              pot:
              snapshot.pot,

              currentBet:
              snapshot.currentBet,

              minimumRaise:
              snapshot.minimumRaise,

              playerContributions: {
                ...snapshot.playerContributions
              },

              totalContributions: {
                ...snapshot.totalContributions
              }
            }
          };
        }
      ),

    summary: {
      ...report.summary
    },

    ...(history.showdown !== undefined
      ? {
        showdown: {
          players:
            history.showdown.players.map(
              player => ({
                playerId:
                player.playerId,

                cards: [
                  {
                    ...player.cards[0]
                  },
                  {
                    ...player.cards[1]
                  }
                ] as [
                  typeof player.cards[0],
                  typeof player.cards[1]
                ]
              })
            ),

          payouts:
            history.showdown.payouts.map(
              payout => ({
                playerId:
                payout.playerId,

                amount:
                payout.amount
              })
            )
        }
      }
      : {}),

    ...(history.startedAt !== undefined
      ? {
        startedAt:
        history.startedAt
      }
      : {}),

    ...(history.completedAt !== undefined
      ? {
        completedAt:
        history.completedAt
      }
      : {})
  };
}