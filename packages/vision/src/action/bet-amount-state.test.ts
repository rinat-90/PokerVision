import {
  describe,
  expect,
  it
} from "vitest";

import {
  diffBetAmountStates
} from "./bet-amount-state.js";

describe(
  "diffBetAmountStates",
  () => {
    it(
      "detects amount appearing",
      () => {
        const result =
          diffBetAmountStates(
            [
              {
                seatIndex: 4,
                hasAmount: false,
                confidence: 0
              }
            ],
            [
              {
                seatIndex: 4,
                hasAmount: true,
                confidence: 0.9
              }
            ]
          );

        expect(
          result
        ).toEqual({
          changed: true,
          changes: [
            {
              seatIndex: 4,
              previousHasAmount: false,
              currentHasAmount: true
            }
          ]
        });
      }
    );

    it(
      "detects amount disappearing",
      () => {
        const result =
          diffBetAmountStates(
            [
              {
                seatIndex: 4,
                hasAmount: true,
                confidence: 0.9
              }
            ],
            [
              {
                seatIndex: 4,
                hasAmount: false,
                confidence: 0
              }
            ]
          );

        expect(
          result.changed
        ).toBe(true);
      }
    );

    it(
      "does not report unchanged state",
      () => {
        const result =
          diffBetAmountStates(
            [
              {
                seatIndex: 4,
                hasAmount: true,
                confidence: 0.9
              }
            ],
            [
              {
                seatIndex: 4,
                hasAmount: true,
                confidence: 0.8
              }
            ]
          );

        expect(
          result.changed
        ).toBe(false);

        expect(
          result.changes
        ).toHaveLength(0);
      }
    );
  }
);