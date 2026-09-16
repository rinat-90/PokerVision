import type {
  HandState,
  PlayerAction
} from "../game-state/types.js";

import {
  applyAction
} from "../game-state/apply-action.js";

export function replayHandToAction(
  initialState: HandState,
  actionIndex: number
): HandState {
  if (
    actionIndex < 0 ||
    actionIndex > initialState.actions.length
  ) {
    throw new Error(
      `Invalid action index: ${actionIndex}`
    );
  }

  let state: HandState = {
    ...initialState,
    actions: [],
    pot: 0,
    playerContributions: {},
    totalContributions: {},
    currentBet: 0,
    minimumRaise: initialState.bigBlind,
    lastAggressorId: null,
    playersToAct: initialState.players
      .filter(
        (player) =>
          player.status === "active"
      )
      .map(
        (player) =>
          player.id
      ),
    currentPlayerId:
      initialState.players[0]?.id ?? null,
    bettingRoundComplete: false
  };

  for (
    let index = 0;
    index < actionIndex;
    index++
  ) {
    const action =
      initialState.actions[index];

    if (action === undefined) {
      throw new Error(
        `Action not found at index ${index}`
      );
    }

    state = applyAction(
      state,
      action
    );
  }

  return state;
}