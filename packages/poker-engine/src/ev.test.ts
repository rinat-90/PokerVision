import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateCallEV
} from "./ev.js";

describe("calculateCallEV", () => {
  it("calculates positive EV", () => {
    const result =
      calculateCallEV(
        0.4,
        100,
        50
      );

    expect(result.ev)
      .toBeCloseTo(10);
  });

  it("calculates negative EV", () => {
    const result =
      calculateCallEV(
        0.2,
        100,
        50
      );

    expect(result.ev)
      .toBeCloseTo(-20);
  });

  it("calculates break-even EV", () => {
    const result =
      calculateCallEV(
        1 / 3,
        100,
        50
      );

    expect(result.ev)
      .toBeCloseTo(0);
  });

  it("rejects invalid equity", () => {
    expect(() =>
      calculateCallEV(
        1.5,
        100,
        50
      )
    ).toThrow(
      "Equity must be between 0 and 1"
    );
  });
});