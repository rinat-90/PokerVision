import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateBetEV
} from "./bet-ev.js";

describe("calculateBetEV", () => {
  it("calculates bet EV with fold equity", () => {
    const result =
      calculateBetEV({
        equity: 0.6,
        potBeforeBet: 100,
        betAmount: 50,
        foldProbability: 0.3
      });

    expect(result.callProbability)
      .toBeCloseTo(0.7);

    expect(result.foldValue)
      .toBe(100);

    expect(result.callValue)
      .toBeCloseTo(70);

    expect(result.ev)
      .toBeCloseTo(79);
  });

  it("handles zero fold probability", () => {
    const result =
      calculateBetEV({
        equity: 0.6,
        potBeforeBet: 100,
        betAmount: 50,
        foldProbability: 0
      });

    expect(result.callProbability)
      .toBe(1);

    expect(result.ev)
      .toBeCloseTo(70);
  });

  it("handles 100 percent fold probability", () => {
    const result =
      calculateBetEV({
        equity: 0.1,
        potBeforeBet: 100,
        betAmount: 50,
        foldProbability: 1
      });

    expect(result.callProbability)
      .toBe(0);

    expect(result.ev)
      .toBe(100);
  });

  it("rejects invalid equity", () => {
    expect(() =>
      calculateBetEV({
        equity: 1.1,
        potBeforeBet: 100,
        betAmount: 50,
        foldProbability: 0.3
      })
    ).toThrow(
      "Equity must be between 0 and 1"
    );
  });

  it("rejects invalid fold probability", () => {
    expect(() =>
      calculateBetEV({
        equity: 0.6,
        potBeforeBet: 100,
        betAmount: 50,
        foldProbability: 1.1
      })
    ).toThrow(
      "Fold probability must be between 0 and 1"
    );
  });
});