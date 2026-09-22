import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  SessionDecision,
} from "./session-decisions";

import {
  createDecisionEvSummary,
  filterSessionDecisionsByEv,
} from "./session-decision-ev";

function createDecision(
  actionIndex: number,
  expectedValue?: number,
): SessionDecision {
  return {
    handId: "A",
    decision: {
      actionIndex,
      street: "flop",
      action: "call",
      amount: 100,
      pot: 300,
      callAmount: 100,
      status:
        expectedValue === undefined
          ? "skipped"
          : "analyzed",
      expectedValue,
    },
  };
}

describe(
  "filterSessionDecisionsByEv",
  () => {
    const decisions = [
      createDecision(1, 557),
      createDecision(2, 0),
      createDecision(3, -3.5),
      createDecision(4),
    ];

    it("returns all decisions", () => {
      expect(
        filterSessionDecisionsByEv(
          decisions,
          "all",
        ),
      ).toHaveLength(4);
    });

    it("filters positive EV", () => {
      const result =
        filterSessionDecisionsByEv(
          decisions,
          "positive",
        );

      expect(
        result.map(
          ({ decision }) =>
            decision.actionIndex,
        ),
      ).toEqual([1]);
    });

    it("filters neutral EV", () => {
      const result =
        filterSessionDecisionsByEv(
          decisions,
          "neutral",
        );

      expect(
        result.map(
          ({ decision }) =>
            decision.actionIndex,
        ),
      ).toEqual([2]);
    });

    it("filters negative EV", () => {
      const result =
        filterSessionDecisionsByEv(
          decisions,
          "negative",
        );

      expect(
        result.map(
          ({ decision }) =>
            decision.actionIndex,
        ),
      ).toEqual([3]);
    });

    it("filters unavailable EV", () => {
      const result =
        filterSessionDecisionsByEv(
          decisions,
          "unavailable",
        );

      expect(
        result.map(
          ({ decision }) =>
            decision.actionIndex,
        ),
      ).toEqual([4]);
    });

    it("does not mutate decisions", () => {
      const original = [
        ...decisions,
      ];

      filterSessionDecisionsByEv(
        decisions,
        "negative",
      );

      expect(decisions).toEqual(
        original,
      );
    });
    it("creates EV bucket summary", () => {
      expect(
        createDecisionEvSummary(
          decisions,
        ),
      ).toEqual({
        all: 4,
        positive: 1,
        neutral: 1,
        negative: 1,
        unavailable: 1,
      });
    });

    it("counts multiple decisions per bucket", () => {
      const result =
        createDecisionEvSummary([
          createDecision(1, 10),
          createDecision(2, 20),
          createDecision(3, -5),
          createDecision(4, -10),
          createDecision(5),
        ]);

      expect(result).toEqual({
        all: 5,
        positive: 2,
        neutral: 0,
        negative: 2,
        unavailable: 1,
      });
    });
  },
);