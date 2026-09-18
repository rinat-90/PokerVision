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
                amount: null,
                rawText: null,
                confidence: 0
              }
            ],
            [
              {
                seatIndex: 4,
                amount: 600,
                rawText: "600",
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
              previousAmount: null,
              currentAmount: 600
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
                amount: 600,
                rawText: "600",
                confidence: 0.9
              }
            ],
            [
              {
                seatIndex: 4,
                amount: null,
                rawText: null,
                confidence: 0
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
              previousAmount: 600,
              currentAmount: null
            }
          ]
        });
      }
    );

    it(
      "detects amount changing",
      () => {
        const result =
          diffBetAmountStates(
            [
              {
                seatIndex: 4,
                amount: 600,
                rawText: "600",
                confidence: 0.5
              }
            ],
            [
              {
                seatIndex: 4,
                amount: 1900,
                rawText: "1,900",
                confidence: 0
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
              previousAmount: 600,
              currentAmount: 1900
            }
          ]
        });
      }
    );

    it(
      "does not report unchanged amount",
      () => {
        const result =
          diffBetAmountStates(
            [
              {
                seatIndex: 4,
                amount: 600,
                rawText: "600",
                confidence: 0.4
              }
            ],
            [
              {
                seatIndex: 4,
                amount: 600,
                rawText: "600",
                confidence: 0.9
              }
            ]
          );

        expect(
          result.changed
        ).toBe(false);

        expect(
          result.changes
        ).toEqual([]);
      }
    );
  }
);