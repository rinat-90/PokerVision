import {
  describe,
  expect,
  it
} from "vitest";

import {
  createPlayerContributionState
} from "./player-contribution-state.js";

describe(
  "createPlayerContributionState",
  () => {
    it(
      "finds highest contribution",
      () => {
        const state =
          createPlayerContributionState(
            "preflop",
            [
              {
                seatIndex: 1,
                amount: 100
              },
              {
                seatIndex: 2,
                amount: 200
              },
              {
                seatIndex: 4,
                amount: 600
              }
            ]
          );

        expect(
          state.highestAmount
        ).toBe(600);

        expect(
          state.complete
        ).toBe(true);
      }
    );

    it(
      "uses zero when there are no contributions",
      () => {
        const state =
          createPlayerContributionState(
            "flop",
            []
          );

        expect(
          state.highestAmount
        ).toBe(0);

        expect(
          state.complete
        ).toBe(true);
      }
    );

    it(
      "preserves street and contributions",
      () => {
        const contributions = [
          {
            seatIndex: 4,
            amount: 1900
          }
        ];

        expect(
          createPlayerContributionState(
            "turn",
            contributions
          )
        ).toEqual({
          street: "turn",
          contributions,
          highestAmount: 1900,
          complete: true
        });
      }
    );

    it(
      "can represent an incomplete contribution snapshot",
      () => {
        const state =
          createPlayerContributionState(
            "preflop",
            [
              {
                seatIndex: 2,
                amount: 200
              }
            ],
            false
          );

        expect(
          state
        ).toEqual({
          street: "preflop",
          contributions: [
            {
              seatIndex: 2,
              amount: 200
            }
          ],
          highestAmount: 200,
          complete: false
        });
      }
    );
  }
);