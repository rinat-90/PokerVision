import {
  describe,
  expect,
  it
} from "vitest";

import {
  createBetState
} from "./bet-state.js";

import {
  detectBetEvents
} from "./bet-event-detector.js";

const seats = [
  0,
  1,
  2,
  3,
  4,
  5
];

describe(
  "detectBetEvents",
  () => {
    it(
      "emits events for appeared bets",
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
          detectBetEvents(
            previous,
            current
          )
        ).toEqual([
          {
            type:
              "betAppeared",
            seatIndex: 4
          },
          {
            type:
              "betAppeared",
            seatIndex: 5
          }
        ]);
      }
    );

    it(
      "emits events for cleared bets",
      () => {
        const previous =
          createBetState(
            seats,
            [1, 2, 4]
          );

        const current =
          createBetState(
            seats,
            []
          );

        expect(
          detectBetEvents(
            previous,
            current
          )
        ).toEqual([
          {
            type:
              "betCleared",
            seatIndex: 1
          },
          {
            type:
              "betCleared",
            seatIndex: 2
          },
          {
            type:
              "betCleared",
            seatIndex: 4
          }
        ]);
      }
    );

    it(
      "emits appearance before clearing",
      () => {
        const previous =
          createBetState(
            seats,
            [1]
          );

        const current =
          createBetState(
            seats,
            [4]
          );

        expect(
          detectBetEvents(
            previous,
            current
          )
        ).toEqual([
          {
            type:
              "betAppeared",
            seatIndex: 4
          },
          {
            type:
              "betCleared",
            seatIndex: 1
          }
        ]);
      }
    );

    it(
      "emits nothing when state is unchanged",
      () => {
        const state =
          createBetState(
            seats,
            [4]
          );

        expect(
          detectBetEvents(
            state,
            state
          )
        ).toEqual([]);
      }
    );
  }
);