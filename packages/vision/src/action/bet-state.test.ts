import {
  describe,
  expect,
  it
} from "vitest";

import {
  createBetState
} from "./bet-state.js";

describe(
  "createBetState",
  () => {
    it(
      "creates bet state for all seats",
      () => {
        const state =
          createBetState(
            [
              0,
              1,
              2,
              3,
              4,
              5
            ],
            [
              1,
              2,
              4
            ]
          );

        expect(
          state
        ).toEqual({
          seats: [
            {
              seatIndex: 0,
              hasBet: false
            },
            {
              seatIndex: 1,
              hasBet: true
            },
            {
              seatIndex: 2,
              hasBet: true
            },
            {
              seatIndex: 3,
              hasBet: false
            },
            {
              seatIndex: 4,
              hasBet: true
            },
            {
              seatIndex: 5,
              hasBet: false
            }
          ]
        });
      }
    );

    it(
      "creates empty bet state",
      () => {
        const state =
          createBetState(
            [
              0,
              1,
              2
            ],
            []
          );

        expect(
          state.seats.every(
            (seat) =>
              !seat.hasBet
          )
        ).toBe(true);
      }
    );
  }
);