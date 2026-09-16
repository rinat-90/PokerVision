import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateRaiseEV
} from "./raise-ev.js";

describe(
  "calculateRaiseEV",
  () => {
    it(
      "calculates raise EV with fold equity",
      () => {
        const result =
          calculateRaiseEV({
            equity: 0.6,
            potBeforeRaise: 100,
            raiseAmount: 50,
            opponentCallAmount: 50,
            foldProbability: 0.3
          });

        expect(
          result.equity
        ).toBe(0.6);

        expect(
          result.potBeforeRaise
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
          result.foldValue
        ).toBe(100);

        expect(
          result.callValue
        ).toBeCloseTo(100);

        expect(
          result.ev
        ).toBeCloseTo(100);
      }
    );

    it(
      "calculates raise EV with no fold equity",
      () => {
        const result =
          calculateRaiseEV({
            equity: 0.6,
            potBeforeRaise: 100,
            raiseAmount: 50,
            opponentCallAmount: 50,
            foldProbability: 0
          });

        expect(
          result.callProbability
        ).toBe(1);

        expect(
          result.callValue
        ).toBeCloseTo(100);

        expect(
          result.ev
        ).toBeCloseTo(100);
      }
    );

    it(
      "calculates raise EV when villain always folds",
      () => {
        const result =
          calculateRaiseEV({
            equity: 0.6,
            potBeforeRaise: 100,
            raiseAmount: 50,
            opponentCallAmount: 50,
            foldProbability: 1
          });

        expect(
          result.callProbability
        ).toBe(0);

        expect(
          result.ev
        ).toBeCloseTo(100);
      }
    );

    it(
      "rejects invalid equity",
      () => {
        expect(() =>
          calculateRaiseEV({
            equity: 1.1,
            potBeforeRaise: 100,
            raiseAmount: 50,
            opponentCallAmount: 50,
            foldProbability: 0.3
          })
        ).toThrow(
          "Equity must be between 0 and 1"
        );
      }
    );

    it(
      "rejects invalid fold probability",
      () => {
        expect(() =>
          calculateRaiseEV({
            equity: 0.6,
            potBeforeRaise: 100,
            raiseAmount: 50,
            opponentCallAmount: 50,
            foldProbability: 1.1
          })
        ).toThrow(
          "Fold probability must be between 0 and 1"
        );
      }
    );
  }
);