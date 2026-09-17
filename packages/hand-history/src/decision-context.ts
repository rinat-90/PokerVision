import type {
  Card,
  PlayerAction,
  Street,
  Range
} from "@poker-vision/poker-engine";

import {
  createRange
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

import {
  createOpponentContext
} from "./opponent-context.js";

import type {
  HandOpponentContext
} from "./opponent-context.js";

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

  raiseAmount?: number;

  opponentCallAmount?: number;

  decisionOptions: DecisionOptions;

  opponentContext: HandOpponentContext;

  targetAction: PlayerAction;
}

export interface CreateDecisionContextOptions {
  villainRange: Range;
}

export function createDecisionContext(
  snapshot: HandStateSnapshot,
  options?: CreateDecisionContextOptions
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

  const villainRange =
    options?.villainRange ??
    createRange([]);

  const opponentContext =
    createOpponentContext(
      snapshot,
      {
        heroPlayerId:
        playerId,

        villainRange
      }
    );

  const baseContext: DecisionContext = {
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

    opponentContext,

    targetAction:
    snapshot.targetAction
  };

  if (
    snapshot.targetAction.type !==
    "raise"
  ) {
    return baseContext;
  }

  const raiseAmount =
    snapshot.targetAction.amount;

  const raiseTotal =
    playerContribution +
    raiseAmount;

  const opponent =
    snapshot.players.find(
      (currentPlayer) =>
        currentPlayer.id !== playerId &&
        currentPlayer.status === "active"
    );

  if (opponent === undefined) {
    throw new Error(
      "No active opponent found for raise decision"
    );
  }

  const opponentContribution =
    snapshot.playerContributions[
      opponent.id
      ] ?? 0;

  const opponentCallAmount =
    Math.max(
      0,
      raiseTotal -
      opponentContribution
    );

  return {
    ...baseContext,

    raiseAmount,

    opponentCallAmount
  };
}