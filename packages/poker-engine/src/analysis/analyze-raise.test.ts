import {
  describe,
  expect,
  it
} from "vitest";

import {
  analyzeRaise
} from "./analyze-raise.js";

describe(
  "analyzeRaise",
  () => {
    it(
      "analyzes a raise",
      () => {
        const result =
          analyzeRaise({
            equity: 0.6,
            pot: 100,
            raiseAmount: 50,
            opponentCallAmount: 50,
            foldProbability: 0.3
          });

        expect(
          result.equity
        ).toBe(0.6);

        expect(
          result.pot
        ).toBe(100);

        expect(
          result.raiseAmount
        ).toBe(50);

        expect(
          result.opponentCallAmount
        ).toBe(50);

        expect(
          result.foldProbability
        ).toBe(0.3);

        expect(
          result.callProbability
        ).toBeCloseTo(0.7);

        expect(
          result.expectedValue
        ).toBeCloseTo(100);
      }
    );

    it(
      "handles a raise with no fold equity",
      () => {
        const result =
          analyzeRaise({
            equity: 0.6,
            pot: 100,
            raiseAmount: 50,
            opponentCallAmount: 50,
            foldProbability: 0
          });

        expect(
          result.callProbability
        ).toBe(1);

        expect(
          result.expectedValue
        ).toBeCloseTo(100);
      }
    );
  }
);