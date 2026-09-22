import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  SessionDecision,
} from "./session-decisions";

import {
  clearDecisionComparison,
  createDecisionComparison,
  selectComparisonDecision,
} from "./decision-comparison";

function createDecision(
  handId: string,
  actionIndex: number,
): SessionDecision {
  return {
    handId,
    decision: {
      actionIndex,
      street: "flop",
      action: "call",
      amount: 100,
      pot: 300,
      callAmount: 100,
      status: "analyzed",
      expectedValue: 10,
    },
  };
}

describe(
  "decision comparison",
  () => {
    const first =
      createDecision("100000", 1);

    const second =
      createDecision("100000", 2);

    const third =
      createDecision("100001", 3);

    it("creates an empty comparison", () => {
      expect(
        createDecisionComparison(),
      ).toEqual({});
    });

    it("selects the left decision first", () => {
      const result =
        selectComparisonDecision(
          createDecisionComparison(),
          first,
        );

      expect(result).toEqual({
        left: first,
      });
    });

    it("selects the right decision second", () => {
      const result =
        selectComparisonDecision(
          {
            left: first,
          },
          second,
        );

      expect(result).toEqual({
        left: first,
        right: second,
      });
    });

    it("removes a selected left decision", () => {
      const result =
        selectComparisonDecision(
          {
            left: first,
            right: second,
          },
          first,
        );

      expect(result).toEqual({
        left: undefined,
        right: second,
      });
    });

    it("removes a selected right decision", () => {
      const result =
        selectComparisonDecision(
          {
            left: first,
            right: second,
          },
          second,
        );

      expect(result).toEqual({
        left: first,
        right: undefined,
      });
    });

    it("shifts comparison when selecting a third decision", () => {
      const result =
        selectComparisonDecision(
          {
            left: first,
            right: second,
          },
          third,
        );

      expect(result).toEqual({
        left: second,
        right: third,
      });
    });

    it("supports decisions from different hands", () => {
      const result =
        selectComparisonDecision(
          {
            left: first,
          },
          third,
        );

      expect(result.left?.handId)
        .toBe("100000");

      expect(result.right?.handId)
        .toBe("100001");
    });

    it("clears the comparison", () => {
      expect(
        clearDecisionComparison(),
      ).toEqual({});
    });
  },
);