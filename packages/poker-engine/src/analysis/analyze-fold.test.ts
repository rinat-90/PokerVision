import {
  describe,
  expect,
  it
} from "vitest";

import {
  analyzeFold
} from "./analyze-fold.js";

describe(
  "analyzeFold",
  () => {
    it(
      "returns zero EV for folding",
      () => {
        const result =
          analyzeFold();

        expect(result).toEqual({
          action: "fold",
          expectedValue: 0,
          decision: "break_even"
        });
      }
    );
  }
);