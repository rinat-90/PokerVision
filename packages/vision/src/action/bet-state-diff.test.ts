import {
  describe,
  expect,
  it
} from "vitest";

import {
  createBetState
} from "./bet-state.js";

import {
  diffBetStates
} from "./bet-state-diff.js";

const seats = [
  0,
  1,
  2,
  3,
  4,
  5
];

describe(
  "diffBetStates",
  () => {
    it(
      "detects appeared bets",
      () => {
        const previous =
          createBetState(
            seats,
            [1, 2]
          );

        const current =
          createBetState(
            seats,
            [1, 2, 4, 5]
          );

        expect(
          diffBetStates(
            previous,
            current
          )
        ).toEqual({
          appeared: [4, 5],
          cleared: []
        });
      }
    );

    it(
      "detects cleared bets",
      () => {
        const previous =
          createBetState(
            seats,
            [1, 2, 4, 5]
          );

        const current =
          createBetState(
            seats,
            []
          );

        expect(
          diffBetStates(
            previous,
            current
          )
        ).toEqual({
          appeared: [],
          cleared: [
            1,
            2,
            4,
            5
          ]
        });
      }
    );

    it(
      "detects simultaneous appearance and clearing",
      () => {
        const previous =
          createBetState(
            seats,
            [1, 2]
          );

        const current =
          createBetState(
            seats,
            [2, 4]
          );

        expect(
          diffBetStates(
            previous,
            current
          )
        ).toEqual({
          appeared: [4],
          cleared: [1]
        });
      }
    );

    it(
      "returns empty diff for equal states",
      () => {
        const state =
          createBetState(
            seats,
            [4]
          );

        expect(
          diffBetStates(
            state,
            state
          )
        ).toEqual({
          appeared: [],
          cleared: []
        });
      }
    );
  }
);