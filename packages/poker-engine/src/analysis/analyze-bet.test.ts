import {
  describe,
  expect,
  it
} from "vitest";

import {
  analyzeBet
} from "./analyze-bet.js";

describe("analyzeBet", () => {
  it("analyzes a bet", () => {
    const result =
      analyzeBet({
        equity: 0.6,
        pot: 100,
        betAmount: 50,
        foldProbability: 0.3
      });

    expect(result.equity)
      .toBe(0.6);

    expect(result.pot)
      .toBe(100);

    expect(result.betAmount)
      .toBe(50);

    expect(result.foldProbability)
      .toBe(0.3);

    expect(result.callProbability)
      .toBeCloseTo(0.7);

    expect(result.expectedValue)
      .toBeCloseTo(79);
  });

  it("handles a bet with no fold equity", () => {
    const result =
      analyzeBet({
        equity: 0.6,
        pot: 100,
        betAmount: 50,
        foldProbability: 0
      });

    expect(result.callProbability)
      .toBe(1);

    expect(result.expectedValue)
      .toBeCloseTo(70);
  });
});