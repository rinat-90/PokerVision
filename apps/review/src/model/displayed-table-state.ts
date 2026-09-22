import type {
  HandReviewAction,
  HandReviewDecisionState
} from "@poker-vision/hand-review";

export interface DisplayedTableState {
  pot: number;
  currentBet: number;
  playerContributions: Record<string, number>;
  totalContributions: Record<string, number>;
  players: HandReviewDecisionState["players"];
}

export function getDisplayedTableState(
  state: HandReviewDecisionState,
  action: HandReviewAction
): DisplayedTableState {
  const contributions = {
    ...state.playerContributions
  };

  const totalContributions = {
    ...state.totalContributions
  };

  const previousContribution =
    contributions[action.playerId] ?? 0;

  let contributionDelta = 0;

  switch (action.type) {
    case "call":
    case "bet":
    case "all_in":
      contributionDelta =
        action.amount;
      break;

    case "raise":
      contributionDelta =
        Math.max(
          0,
          action.amount -
          previousContribution
        );
      break;

    case "fold":
    case "check":
      contributionDelta = 0;
      break;
  }

  if (contributionDelta > 0) {
    contributions[action.playerId] =
      previousContribution +
      contributionDelta;

    totalContributions[action.playerId] =
      (
        totalContributions[
          action.playerId
          ] ?? 0
      ) +
      contributionDelta;
  }

  const players =
    state.players.map(player => {
      if (
        player.id !== action.playerId
      ) {
        return player;
      }

      let status = player.status;

      if (action.type === "fold") {
        status = "folded";
      }

      const stack = Math.max(
        0,
        player.stack -
        contributionDelta
      );

      if (
        stack === 0 &&
        contributionDelta > 0
      ) {
        status = "all_in";
      }

      return {
        ...player,
        stack,
        status
      };
    });

  return {
    pot:
      state.pot +
      contributionDelta,

    currentBet:
      Math.max(
        state.currentBet,
        contributions[
          action.playerId
          ] ?? 0
      ),

    playerContributions:
    contributions,

    totalContributions,

    players
  };
}