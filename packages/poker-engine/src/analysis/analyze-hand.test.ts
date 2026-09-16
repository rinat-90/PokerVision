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
  analyzeHand
} from "./analyze-hand.js";

const card = (
  rank: Card["rank"],
  suit: Card["suit"]
): Card => ({
  rank,
  suit
});

describe("analyzeHand", () => {
  it("combines equity, pot odds and EV", () => {
    const villainRange =
      createRange([
        "QQ",
        "JJ",
        "TT",
        "AKs",
        "AQs"
      ]);

    const result =
      analyzeHand({
        heroCards: [
          card("A", "spades"),
          card("J", "spades")
        ],

        villainRange,

        board: [
          card("K", "spades"),
          card("7", "hearts"),
          card("2", "clubs")
        ],

        pot: 100,

        callAmount: 50,

        iterationsPerCombo: 500
      });

    expect(result.equity)
      .toBeGreaterThan(0);

    expect(result.equity)
      .toBeLessThan(1);

    expect(
      result.potOdds.requiredEquity
    ).toBeCloseTo(1 / 3);

    expect(
      result.expectedValue
    ).toBeDefined();

    expect([
      "profitable",
      "unprofitable",
      "break_even"
    ]).toContain(
      result.decision
    );

    expect(
      result.validVillainCombos
    ).toBeGreaterThan(0);
  });

  it("identifies a clearly profitable call", () => {
    const villainRange =
      createRange(["KK"]);

    const result =
      analyzeHand({
        heroCards: [
          card("A", "spades"),
          card("A", "hearts")
        ],

        villainRange,

        board: [
          card("2", "clubs"),
          card("7", "diamonds"),
          card("9", "hearts")
        ],

        pot: 100,

        callAmount: 20,

        iterationsPerCombo: 500
      });

    expect(result.decision)
      .toBe("profitable");

    expect(
      result.expectedValue.ev
    ).toBeGreaterThan(0);
  });
});