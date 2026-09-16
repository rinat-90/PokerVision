import {
  describe,
  expect,
  it
} from "vitest";

import type { Card } from "../types.js";

import {
  createRange
} from "../range/range.js";

import {
  calculateRangeEquity
} from "./range-equity.js";

const card = (
  rank: Card["rank"],
  suit: Card["suit"]
): Card => ({
  rank,
  suit
});

describe("calculateRangeEquity", () => {
  it("calculates equity against a range", () => {
    const villainRange = createRange([
      "AA",
      "KK",
      "QQ",
      "AKs"
    ]);

    const result =
      calculateRangeEquity({
        heroCards: [
          card("A", "clubs"),
          card("J", "clubs")
        ],
        villainRange,
        board: [
          card("7", "diamonds"),
          card("4", "hearts"),
          card("2", "clubs")
        ],
        iterationsPerCombo: 500
      });

    expect(result.combos).toBeGreaterThan(0);
    expect(result.equity).toBeGreaterThan(0);
    expect(result.equity).toBeLessThan(1);
  });

  it("removes impossible combinations", () => {
    const villainRange = createRange([
      "AA"
    ]);

    const result =
      calculateRangeEquity({
        heroCards: [
          card("A", "clubs"),
          card("J", "clubs")
        ],
        villainRange,
        board: [],
        iterationsPerCombo: 100
      });

    // AA has 6 combinations.
    // Hero holds one ace, so only 3 remain.
    expect(result.combos).toBe(3);
  });

  it("removes combinations containing board cards", () => {
    const villainRange = createRange([
      "AA"
    ]);

    const result =
      calculateRangeEquity({
        heroCards: [
          card("K", "clubs"),
          card("Q", "clubs")
        ],
        villainRange,
        board: [
          card("A", "clubs")
        ],
        iterationsPerCombo: 100
      });

    // One ace is on the board.
    // AA therefore has 3 valid combinations.
    expect(result.combos).toBe(3);
  });
});