import type {
  PlayerAction
} from "@poker-vision/poker-engine";

import {
  replayHandToAction
} from "./replay-hand.js";

import type {
  DecisionPoint
} from "./decision-points.js";

import type {
  HandHistory
} from "./types.js";

export function resolveDecisionPoints(
  hand: HandHistory,
  decisionPoints: DecisionPoint[]
): DecisionPoint[] {
  const resolved: DecisionPoint[] = [];

  for (const decisionPoint of decisionPoints) {
    const snapshot =
      replayHandToAction(
        hand,
        decisionPoint.actionIndex
      );

    if (
      snapshot.targetAction.playerId !==
      decisionPoint.playerId
    ) {
      continue;
    }

    if (
      snapshot.targetAction.street !==
      decisionPoint.street
    ) {
      continue;
    }

    if (
      !isPlayerExpectedToAct(
        snapshot.playersToAct,
        decisionPoint.playerId
      )
    ) {
      continue;
    }

    resolved.push(decisionPoint);
  }

  return resolved;
}

function isPlayerExpectedToAct(
  playersToAct: string[],
  playerId: string
): boolean {
  return playersToAct.includes(playerId);
}