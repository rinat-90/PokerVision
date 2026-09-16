import {
  describe,
  expect,
  it
} from "vitest";

import {
  parseHandNotation
} from "./parser.js";

import {
  createRange
} from "./range.js";

describe("range parser", () => {
  it("generates 6 combinations for AA", () => {
    const combos =
      parseHandNotation("AA");

    expect(combos).toHaveLength(6);
  });

  it("generates 4 combinations for AKs", () => {
    const combos =
      parseHandNotation("AKs");

    expect(combos).toHaveLength(4);
  });

  it("generates 12 combinations for AKo", () => {
    const combos =
      parseHandNotation("AKo");

    expect(combos).toHaveLength(12);
  });

  it("generates 16 combinations for AK", () => {
    const combos =
      parseHandNotation("AK");

    expect(combos).toHaveLength(16);
  });

  it("creates a combined range", () => {
    const range = createRange([
      "AA",
      "KK",
      "AKs"
    ]);

    expect(range.combos).toHaveLength(
      6 + 6 + 4
    );
  });
});