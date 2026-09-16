import type {
  ActionType,
  HandState,
  PlayerAction
} from "./types.js";

import {
  validateAction
} from "./betting-rules.js";

import {
  applyBettingRoundAction
} from "./betting-round.js";

export function applyAction(
  state: HandState,
  action: PlayerAction
): HandState {
  const player = state.players.find(
    (currentPlayer) =>
      currentPlayer.id === action.playerId
  );

  if (player === undefined) {
    throw new Error(
      `Player not found: ${action.playerId}`
    );
  }

  const validation = validateAction(
    state,
    player,
    action.type,
    action.amount
  );

  if (!validation.valid) {
    throw new Error(
      validation.error ??
      "Invalid action"
    );
  }

  /*
   * Contribution during the current street.
   */
  const previousContribution =
    state.playerContributions[player.id] ?? 0;

  const newContribution =
    previousContribution +
    action.amount;

  /*
   * Contribution during the entire hand.
   *
   * Unlike playerContributions, this value
   * survives street transitions.
   */
  const previousTotalContribution =
    state.totalContributions[player.id] ?? 0;

  const newTotalContribution =
    previousTotalContribution +
    action.amount;

  const updatedStack =
    player.stack -
    action.amount;

  const updatedStatus =
    getUpdatedStatus(
      action.type,
      updatedStack
    );

  const updatedPlayers =
    state.players.map(
      (currentPlayer) =>
        currentPlayer.id === player.id
          ? {
            ...currentPlayer,
            stack: updatedStack,
            status: updatedStatus
          }
          : currentPlayer
    );

  /*
   * Update current-street contribution.
   */
  const updatedContributions = {
    ...state.playerContributions,
    [player.id]:
    newContribution
  };

  /*
   * Update total hand contribution.
   */
  const updatedTotalContributions = {
    ...state.totalContributions,
    [player.id]:
    newTotalContribution
  };

  const nextCurrentBet =
    getNextCurrentBet(
      state,
      action,
      newContribution
    );

  const nextMinimumRaise =
    getNextMinimumRaise(
      state,
      action,
      newContribution
    );

  const nextLastAggressor =
    getNextLastAggressor(
      state,
      action
    );

  const updatedActions = [
    ...state.actions,
    action
  ];

  const stateAfterAction: HandState = {
    ...state,
    players: updatedPlayers,
    pot:
      state.pot +
      action.amount,
    actions: updatedActions,
    currentPlayerId: null,
    playersToAct:
    state.playersToAct,
    currentBet:
    nextCurrentBet,
    minimumRaise:
    nextMinimumRaise,
    lastAggressorId:
    nextLastAggressor,
    playerContributions:
    updatedContributions,
    totalContributions:
    updatedTotalContributions,
    bettingRoundComplete:
      false
  };

  const bettingRound =
    applyBettingRoundAction(
      stateAfterAction,
      action,
      updatedPlayers,
      nextCurrentBet
    );

  return {
    ...stateAfterAction,
    playersToAct:
    bettingRound.playersToAct,
    currentPlayerId:
    bettingRound.currentPlayerId,
    bettingRoundComplete:
    bettingRound.bettingRoundComplete
  };
}

function getNextCurrentBet(
  state: HandState,
  action: PlayerAction,
  contribution: number
): number {
  if (
    action.type === "bet" ||
    action.type === "raise" ||
    action.type === "all_in"
  ) {
    return Math.max(
      state.currentBet,
      contribution
    );
  }

  return state.currentBet;
}

function getNextMinimumRaise(
  state: HandState,
  action: PlayerAction,
  contribution: number
): number {
  if (
    action.type !== "bet" &&
    action.type !== "raise" &&
    action.type !== "all_in"
  ) {
    return state.minimumRaise;
  }

  const raiseSize =
    contribution -
    state.currentBet;

  if (state.currentBet === 0) {
    return contribution;
  }

  if (
    raiseSize <
    state.minimumRaise
  ) {
    return state.minimumRaise;
  }

  return raiseSize;
}

function getNextLastAggressor(
  state: HandState,
  action: PlayerAction
): string | null {
  if (
    action.type === "bet" ||
    action.type === "raise" ||
    action.type === "all_in"
  ) {
    return action.playerId;
  }

  return state.lastAggressorId;
}

function getUpdatedStatus(
  action: ActionType,
  remainingStack: number
) {
  if (action === "fold") {
    return "folded" as const;
  }

  if (
    action === "all_in" ||
    remainingStack === 0
  ) {
    return "all_in" as const;
  }

  return "active" as const;
}