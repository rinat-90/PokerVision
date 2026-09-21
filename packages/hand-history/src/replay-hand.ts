import {
  normalizeActionAmount
} from "./normalize-action.js";

import type {
  Card,
  HandState,
  Player,
  PlayerAction
} from "@poker-vision/poker-engine";

import type {
  HandHistory,
  HandHistoryAction
} from "./types.js";

import {
  derivePlayerStatus
} from "./player-status.js";

import {
  reconstructBettingState
} from "./betting-state.js";

export interface HandStateSnapshot {
  /**
   * Index of the action that is about to happen.
   *
   * All actions before this index have already happened.
   */
  actionIndex: number;

  /**
   * The action that is about to happen.
   */
  targetAction: PlayerAction;

  street: HandState["street"];

  board: Card[];

  players: Player[];

  playersToAct: string[];

  currentPlayerId: string | null;

  bettingRoundComplete: boolean;

  /**
   * Pot before the target action.
   */
  pot: number;

  /**
   * Highest contribution on the current street.
   */
  currentBet: number;

  minimumRaise: number;

  /**
   * Contributions on the current street.
   */
  playerContributions: Record<string, number>;

  /**
   * Contributions across the entire hand.
   */
  totalContributions: Record<string, number>;

  /**
   * Actions that happened before the target action.
   */
  actions: PlayerAction[];
}

export function replayHandToAction(
  hand: HandHistory,
  actionIndex: number
): HandStateSnapshot {
  const allActions =
    flattenActions(hand);

  if (actionIndex < 0) {
    throw new Error(
      `Action index must be >= 0: ${actionIndex}`
    );
  }

  if (actionIndex >= allActions.length) {
    throw new Error(
      `Action index ${actionIndex} is out of range. ` +
      `History contains ${allActions.length} actions.`
    );
  }

  const targetHistoryAction =
    allActions[actionIndex];

  if (targetHistoryAction === undefined) {
    throw new Error(
      `Action not found at index ${actionIndex}`
    );
  }

  const actionsBeforeDecision =
    allActions.slice(
      0,
      actionIndex
    );

  const street =
    targetHistoryAction.street;

  const board =
    getBoardForStreet(
      hand,
      street
    );

  const totalContributions =
    calculateTotalContributions(
      hand,
      actionsBeforeDecision
    );

  const playerContributions =
    calculateStreetContributions(
      hand,
      actionsBeforeDecision,
      street
    );

  const previousContribution =
    playerContributions[
      targetHistoryAction.playerId
      ] ?? 0;

  const targetAction =
    toEngineAction(
      targetHistoryAction,
      previousContribution
    );

  const pot =
    Object.values(
      totalContributions
    ).reduce(
      (sum, amount) =>
        sum + amount,
      0
    );

  const players =
    createPlayers(
      hand,
      totalContributions,
      actionsBeforeDecision
    );

  const currentBet =
    Math.max(
      0,
      ...Object.values(
        playerContributions
      )
    );

  const bettingState =
    reconstructBettingState(
      players,
      actionsBeforeDecision.map(
        action =>
          toEngineAction(action)
      ),
      street,
      currentBet,
      playerContributions
    );

  return {
    actionIndex,
    targetAction,
    street,
    board,
    players,

    playersToAct:
    bettingState.playersToAct,

    currentPlayerId:
    bettingState.currentPlayerId,

    bettingRoundComplete:
    bettingState.bettingRoundComplete,

    pot,
    currentBet,

    minimumRaise:
    hand.bigBlind,

    playerContributions,
    totalContributions,

    actions:
      actionsBeforeDecision.map(
        action =>
          toEngineAction(action)
      )
  };
}

function flattenActions(
  hand: HandHistory
): HandHistoryAction[] {
  return hand.streets.flatMap(
    street =>
      street.actions
  );
}

function getBoardForStreet(
  hand: HandHistory,
  street: HandState["street"]
): Card[] {
  const streetData =
    hand.streets.find(
      item =>
        item.street === street
    );

  return streetData?.board ?? [];
}

function calculateTotalContributions(
  hand: HandHistory,
  actions: HandHistoryAction[]
): Record<string, number> {
  const contributions:
    Record<string, number> = {};

  for (const player of hand.players) {
    contributions[player.id] = 0;
  }

  for (
    const forcedBet of
  hand.forcedBets ?? []
    ) {
    contributions[
      forcedBet.playerId
      ] =
      (
        contributions[
          forcedBet.playerId
          ] ?? 0
      ) +
      forcedBet.amount;
  }

  const streetContributions:
    Record<string, number> = {};

  for (const player of hand.players) {
    streetContributions[
      player.id
      ] = 0;
  }

  for (
    const forcedBet of
  hand.forcedBets ?? []
    ) {
    streetContributions[
      forcedBet.playerId
      ] =
      (
        streetContributions[
          forcedBet.playerId
          ] ?? 0
      ) +
      forcedBet.amount;
  }

  let currentStreet:
    HandHistoryAction["street"] =
    "preflop";

  for (const action of actions) {
    if (
      action.street !==
      currentStreet
    ) {
      currentStreet =
        action.street;

      for (
        const player of
        hand.players
        ) {
        streetContributions[
          player.id
          ] = 0;
      }
    }

    if (
      action.type === "fold" ||
      action.type === "check"
    ) {
      continue;
    }

    const previousStreetContribution =
      streetContributions[
        action.playerId
        ] ?? 0;

    const contributionAmount =
      normalizeActionAmount(
        action,
        previousStreetContribution
      );

    contributions[
      action.playerId
      ] =
      (
        contributions[
          action.playerId
          ] ?? 0
      ) +
      contributionAmount;

    streetContributions[
      action.playerId
      ] =
      previousStreetContribution +
      contributionAmount;
  }

  return contributions;
}

function calculateStreetContributions(
  hand: HandHistory,
  actions: HandHistoryAction[],
  street: HandState["street"]
): Record<string, number> {
  const contributions:
    Record<string, number> = {};

  for (const player of hand.players) {
    contributions[player.id] = 0;
  }

  if (street === "preflop") {
    for (
      const forcedBet of
    hand.forcedBets ?? []
      ) {
      contributions[
        forcedBet.playerId
        ] =
        (
          contributions[
            forcedBet.playerId
            ] ?? 0
        ) +
        forcedBet.amount;
    }
  }

  for (const action of actions) {
    if (
      action.street !== street
    ) {
      continue;
    }

    if (
      action.type === "fold" ||
      action.type === "check"
    ) {
      continue;
    }

    const previousContribution =
      contributions[
        action.playerId
        ] ?? 0;

    const contributionAmount =
      normalizeActionAmount(
        action,
        previousContribution
      );

    contributions[
      action.playerId
      ] =
      previousContribution +
      contributionAmount;
  }

  return contributions;
}

function createPlayers(
  hand: HandHistory,
  totalContributions:
  Record<string, number>,
  actions: HandHistoryAction[]
): Player[] {
  return hand.players.map(
    player => {
      const contribution =
        totalContributions[
          player.id
          ] ?? 0;

      const status =
        derivePlayerStatus(
          player.id,
          actions
        );

      const basePlayer: Player = {
        id:
        player.id,

        name:
        player.name,

        position:
        player.position,

        stack:
          player.startingStack -
          contribution,

        status
      };

      if (
        player.holeCards !==
        undefined
      ) {
        return {
          ...basePlayer,
          holeCards:
          player.holeCards
        };
      }

      return basePlayer;
    }
  );
}

function toEngineAction(
  action: HandHistoryAction,
  previousContribution = 0
): PlayerAction {
  const amount =
    action.type === "fold" ||
    action.type === "check"
      ? action.amount
      : normalizeActionAmount(
        action,
        previousContribution
      );

  return {
    playerId:
    action.playerId,

    type:
    action.type,

    amount,

    street:
    action.street
  };
}