import { describe, expect, it } from "vitest";

import {
  analyzeDecision,
} from "./analyze-decision.js";

import {
  createRange,
} from "../range/range.js";

import type {
  Card,
} from "../types.js";

describe("analyzeDecision", () => {
  it("analyzes a call decision", () => {
    const heroCards: Card[] = [
      { rank: "A", suit: "spades" },
      { rank: "K", suit: "spades" },
    ];

    const board: Card[] = [
      { rank: "Q", suit: "spades" },
      { rank: "7", suit: "diamonds" },
      { rank: "2", suit: "clubs" },
    ];

    const villainRange =
      createRange([
        "QQ",
        "KK",
        "AA",
        "AK",
        "AQ",
      ]);

    const result =
      analyzeDecision({
        action: "call",
        heroCards,
        villainRange,
        board,
        pot: 100,
        callAmount: 50,
      });

    expect(result.action).toBe("call");

    expect(result.equity)
      .toBeGreaterThanOrEqual(0);

    expect(result.equity)
      .toBeLessThanOrEqual(1);

    expect(result.expectedValue)
      .toBeDefined();

    expect(result.potOdds)
      .toBeDefined();

    expect(result.validVillainCombos)
      .toBeGreaterThan(0);

    expect([
      "profitable",
      "unprofitable",
      "break_even",
    ]).toContain(result.decision);
  });

  it("requires callAmount for a call decision", () => {
    const heroCards: Card[] = [
      { rank: "A", suit: "spades" },
      { rank: "K", suit: "spades" },
    ];

    const villainRange =
      createRange([
        "QQ",
        "KK",
        "AA",
        "AK",
        "AQ",
      ]);

    expect(() =>
      analyzeDecision({
        action: "call",
        heroCards,
        villainRange,
        board: [],
        pot: 100,
      }),
    ).toThrow(
      "callAmount is required when analyzing a call decision",
    );
  });

  it("analyzes a bet decision", () => {
    const heroCards: Card[] = [
      { rank: "A", suit: "spades" },
      { rank: "K", suit: "spades" },
    ];

    const board: Card[] = [
      { rank: "Q", suit: "spades" },
      { rank: "7", suit: "diamonds" },
      { rank: "2", suit: "clubs" },
    ];

    const villainRange =
      createRange([
        "QQ",
        "KK",
        "AA",
        "AK",
        "AQ",
      ]);

    const result =
      analyzeDecision({
        action: "bet",
        heroCards,
        villainRange,
        board,
        pot: 100,
        betAmount: 50,
        foldProbability: 0.3,
        iterationsPerCombo: 100,
      });

    expect(result.action)
      .toBe("bet");

    expect(result.equity)
      .toBeGreaterThanOrEqual(0);

    expect(result.equity)
      .toBeLessThanOrEqual(1);

    expect(result.expectedValue)
      .toBeDefined();

    expect([
      "profitable",
      "unprofitable",
      "break_even",
    ]).toContain(result.decision);

    expect(result.validVillainCombos)
      .toBeGreaterThan(0);
  });

  it("requires betAmount for a bet decision", () => {
    const heroCards: Card[] = [
      { rank: "A", suit: "spades" },
      { rank: "K", suit: "spades" },
    ];

    const villainRange =
      createRange([
        "QQ",
        "KK",
        "AA",
        "AK",
        "AQ",
      ]);

    expect(() =>
      analyzeDecision({
        action: "bet",
        heroCards,
        villainRange,
        board: [],
        pot: 100,
        foldProbability: 0.3,
      })
    ).toThrow(
      "betAmount is required when analyzing a bet decision"
    );
  });

  it("requires foldProbability for a bet decision", () => {
    const heroCards: Card[] = [
      { rank: "A", suit: "spades" },
      { rank: "K", suit: "spades" },
    ];

    const villainRange =
      createRange([
        "QQ",
        "KK",
        "AA",
        "AK",
        "AQ",
      ]);

    expect(() =>
      analyzeDecision({
        action: "bet",
        heroCards,
        villainRange,
        board: [],
        pot: 100,
        betAmount: 50,
      })
    ).toThrow(
      "foldProbability is required when analyzing a bet decision"
    );
  });

  it("returns not_applicable for unsupported actions", () => {
    const heroCards: Card[] = [
      { rank: "A", suit: "spades" },
      { rank: "K", suit: "spades" },
    ];

    const villainRange =
      createRange([
        "QQ",
        "KK",
        "AA",
        "AK",
        "AQ",
      ]);

    const result =
      analyzeDecision({
        action: "fold",
        heroCards,
        villainRange,
        board: [],
        pot: 100,
      });

    expect(result.action)
      .toBe("fold");

    expect(result.decision)
      .toBe("not_applicable");

    expect(result.equity)
      .toBe(0);

    expect(result.validVillainCombos)
      .toBe(0);

    expect(result.expectedValue)
      .toBeUndefined();

    expect(result.potOdds)
      .toBeUndefined();
  });
});