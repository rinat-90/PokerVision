import type {
  AnalysisReport,
  HandHistory
} from "@poker-vision/hand-history";

import type {
  HandReview,
  HandReviewAction,
  HandReviewStreet
} from "./hand-review";

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
            action => ({
              actionIndex:
                actionIndex++,

              playerId:
              action.playerId,

              street:
              action.street,

              type:
              action.type,

              amount:
              action.amount
            })
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
                { ...player.holeCards[0] },
                { ...player.holeCards[1] }
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
        decision => ({
          ...decision
        })
      ),

    summary: {
      ...report.summary
    },

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