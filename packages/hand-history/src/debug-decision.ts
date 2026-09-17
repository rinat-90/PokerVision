import {
  replayHandToAction
} from "./replay-hand.js";

import type {
  HandHistory
} from "./types.js";

export function debugHand(
  hand: HandHistory
): void {
  const actions =
    hand.streets.flatMap(
      (street) => street.actions
    );

  console.log("\n=== DEBUG HAND ===\n");

  actions.forEach((action, index) => {
    const snapshot =
      replayHandToAction(
        hand,
        index
      );

    console.log(
      [
        `${index + 1}.`,
        `${action.street.toUpperCase()}`,
        action.playerId,
        action.type,
        `amount=${action.amount}`,
        `current=${snapshot.currentPlayerId}`,
        `toAct=[${snapshot.playersToAct.join(", ")}]`,
        `pot=${snapshot.pot}`,
        `currentBet=${snapshot.currentBet}`,
        `streetContrib=${JSON.stringify(snapshot.playerContributions)}`,
        `totalContrib=${JSON.stringify(snapshot.totalContributions)}`
      ].join(" | ")
    );
  });
}