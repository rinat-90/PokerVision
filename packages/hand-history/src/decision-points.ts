import type {
  PlayerAction,
  Street
} from "@poker-vision/poker-engine";

import {
  replayHandToAction
} from "./replay-hand.js";

import type {
  HandHistory
} from "./types.js";

export interface DecisionPoint {
  actionIndex: number;
  playerId: string;
  street: Street;
  action: PlayerAction;
}

export interface FindDecisionPointsOptions {
  playerId: string;
}

export function findDecisionPoints(
  hand: HandHistory,
  options: FindDecisionPointsOptions
): DecisionPoint[] {
  const allActions =
    hand.streets.flatMap(
      (street) => street.actions
    );

  const decisionPoints: DecisionPoint[] = [];

  for (
    let actionIndex = 0;
    actionIndex < allActions.length;
    actionIndex++
  ) {
    const action =
      allActions[actionIndex];

    if (action === undefined) {
      continue;
    }

    if (
      action.playerId !==
      options.playerId
    ) {
      continue;
    }

    const snapshot =
      replayHandToAction(
        hand,
        actionIndex
      );

    if (
      snapshot.currentPlayerId !==
      options.playerId
    ) {
      continue;
    }

    decisionPoints.push({
      actionIndex,
      playerId:
      action.playerId,
      street:
      action.street,
      action:
        toEngineAction(action)
    });
  }

  return decisionPoints;
}

function toEngineAction(
  action:
  HandHistory["streets"][number]["actions"][number]
): PlayerAction {
  return {
    playerId:
    action.playerId,

    type:
    action.type,

    amount:
    action.amount,

    street:
    action.street
  };
}