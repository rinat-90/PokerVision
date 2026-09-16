import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculatePotOdds
} from "./pot-odds.js";

describe("calculatePotOdds", () => {
  it("calculates required equity", () => {
    const result =
      calculatePotOdds(100, 50);

    expect(result.potAfterCall)
      .toBe(150);

    expect(result.requiredEquity)
      .toBeCloseTo(1 / 3);

    expect(result.ratio)
      .toBe("100:50");
  });

  it("handles a half-pot bet", () => {
    const result =
      calculatePotOdds(100, 50);

    expect(result.requiredEquity)
      .toBeCloseTo(0.3333333);
  });

  it("rejects negative pot", () => {
    expect(() =>
      calculatePotOdds(-10, 5)
    ).toThrow(
      "Pot cannot be negative"
    );
  });

  it("rejects zero call", () => {
    expect(() =>
      calculatePotOdds(100, 0)
    ).toThrow(
      "Call amount must be greater than zero"
    );
  });
});