import type {
  Card,
  PlayerAction,
  Street
} from "@poker-vision/poker-engine";

import type {
  HandStateSnapshot
} from "./replay-hand.js";

import {
  getDecisionOptions
} from "./decision-options.js";

import type {
  DecisionOptions
} from "./decision-options.js";

export interface DecisionContext {
  actionIndex: number;

  playerId: string;

  street: Street;

  heroCards: Card[];

  board: Card[];

  pot: number;

  currentBet: number;

  playerContribution: number;

  callAmount: number;

  decisionOptions: DecisionOptions;

  targetAction: PlayerAction;
}

export function createDecisionContext(
  snapshot: HandStateSnapshot
): DecisionContext {
  const playerId =
    snapshot.targetAction.playerId;

  const player =
    snapshot.players.find(
      (currentPlayer) =>
        currentPlayer.id === playerId
    );

  if (player === undefined) {
    throw new Error(
      `Player not found: ${playerId}`
    );
  }

  if (player.holeCards === undefined) {
    throw new Error(
      `Player has no hole cards: ${playerId}`
    );
  }

  const playerContribution =
    snapshot.playerContributions[playerId] ?? 0;

  const callAmount =
    Math.max(
      0,
      snapshot.currentBet -
      playerContribution
    );

  const decisionOptions =
    getDecisionOptions(
      player,
      snapshot.currentBet,
      playerContribution,
      snapshot.minimumRaise
    );

  return {
    actionIndex:
    snapshot.actionIndex,

    playerId,

    street:
    snapshot.street,

    heroCards:
    player.holeCards,

    board:
    snapshot.board,

    pot:
    snapshot.pot,

    currentBet:
    snapshot.currentBet,

    playerContribution,

    callAmount,

    decisionOptions,

    targetAction:
    snapshot.targetAction
  };
}