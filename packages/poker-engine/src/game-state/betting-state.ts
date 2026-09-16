import type { HandState, PlayerAction } from "./types.js";

export interface BettingState {
  street: HandState["street"];

  currentBet: number;

  lastAggressorId: string | null;

  playerContributions: Record<string, number>;

  playersToAct: string[];
}

export function createBettingState(
  state: HandState
): BettingState {
  const playerContributions: Record<string, number> = {};

  for (const player of state.players) {
    playerContributions[player.id] = 0;
  }

  return {
    street: state.street,

    currentBet: 0,

    lastAggressorId: null,

    playerContributions,

    playersToAct: state.players
      .filter((player) => player.status === "active")
      .map((player) => player.id)
  };
}

export function applyBettingAction(
  bettingState: BettingState,
  action: PlayerAction
): BettingState {
  const currentContribution =
    bettingState.playerContributions[action.playerId] ?? 0;

  const newContribution =
    currentContribution + action.amount;

  const updatedContributions = {
    ...bettingState.playerContributions,
    [action.playerId]: newContribution
  };

  let currentBet = bettingState.currentBet;
  let lastAggressorId =
    bettingState.lastAggressorId;

  if (
    action.type === "bet" ||
    action.type === "raise" ||
    action.type === "all_in"
  ) {
    currentBet = Math.max(
      currentBet,
      newContribution
    );

    lastAggressorId = action.playerId;
  }

  const playersToAct =
    bettingState.playersToAct.filter(
      (playerId) =>
        playerId !== action.playerId
    );

  return {
    ...bettingState,

    currentBet,

    lastAggressorId,

    playerContributions:
    updatedContributions,

    playersToAct
  };
}