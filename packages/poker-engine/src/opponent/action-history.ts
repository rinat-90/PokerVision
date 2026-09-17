import type {
  PlayerAction
} from "../game-state/types.js";

import type {
  Street
} from "../types.js";

export interface OpponentActionHistoryEntry {
  actionIndex: number;
  playerId: string;
  type: PlayerAction["type"];
  amount: number;
  street: Street;
}

export interface OpponentActionHistory {
  playerId: string;
  actions: OpponentActionHistoryEntry[];
}

export interface CreateOpponentActionHistoryInput {
  playerId: string;
  actions: PlayerAction[];
  currentActionIndex: number;
}

export function createOpponentActionHistory(
  input: CreateOpponentActionHistoryInput
): OpponentActionHistory {
  const {
    playerId,
    actions,
    currentActionIndex
  } = input;

  const opponentActions: OpponentActionHistoryEntry[] = [];

  for (
    let actionIndex = 0;
    actionIndex < actions.length;
    actionIndex += 1
  ) {
    if (
      actionIndex >= currentActionIndex
    ) {
      break;
    }

    const action =
      actions[actionIndex];

    if (action === undefined) {
      continue;
    }

    if (
      action.playerId !== playerId
    ) {
      continue;
    }

    opponentActions.push({
      actionIndex,
      playerId:
      action.playerId,
      type:
      action.type,
      amount:
      action.amount,
      street:
      action.street
    });
  }

  return {
    playerId,
    actions:
    opponentActions
  };
}