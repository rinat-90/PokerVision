import type {
  BetState
} from "./bet-state.js";

import {
  diffBetStates
} from "./bet-state-diff.js";

export type BetEvent =
  | {
  type: "betAppeared";
  seatIndex: number;
}
  | {
  type: "betCleared";
  seatIndex: number;
};

export function createBetEvent(
  seatIndex: number,
  hasBet: boolean
): BetEvent {
  return {
    type:
      hasBet
        ? "betAppeared"
        : "betCleared",
    seatIndex
  };
}

export function detectBetEvents(
  previous: BetState,
  current: BetState
): BetEvent[] {
  const diff =
    diffBetStates(
      previous,
      current
    );

  return [
    ...diff.appeared.map(
      (seatIndex) =>
        createBetEvent(
          seatIndex,
          true
        )
    ),
    ...diff.cleared.map(
      (seatIndex) =>
        createBetEvent(
          seatIndex,
          false
        )
    )
  ];
}