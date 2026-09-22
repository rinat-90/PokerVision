import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  SessionDecision,
} from "./session-decisions";

import {
  createDecisionComparisonDelta,
} from "./decision-comparison-delta";

function createDecision(
  overrides: Partial<
    SessionDecision["decision"]
  > = {},
): SessionDecision {
  return {
    handId: "100000",
    decision: {
      actionIndex: 1,
      street: "flop",
      action: "call",
      amount: 100,
      pot: 500,
      callAmount: 100,
      status: "analyzed",
      equity: 0.4,
      potOdds: 0.25,
      expectedValue: 50,
      ...overrides,
    },
  };
}

describe(
  "createDecisionComparisonDelta",
  () => {
    it(
      "calculates right minus left",
      () => {
        const left =
          createDecision();

        const right =
          createDecision({
            pot: 800,
            callAmount: 200,
            equity: 0.55,
            potOdds: 0.3,
            expectedValue: 125,
          });

        const delta =
          createDecisionComparisonDelta(
            left,
            right,
          );

        expect(
          delta.expectedValue,
        ).toBe(75);

        expect(
          delta.equity,
        ).toBeCloseTo(0.15);

        expect(
          delta.potOdds,
        ).toBeCloseTo(0.05);

        expect(
          delta.pot,
        ).toBe(300);

        expect(
          delta.callAmount,
        ).toBe(100);
      },
    );

    it(
      "supports negative deltas",
      () => {
        const left =
          createDecision({
            expectedValue: 100,
          });

        const right =
          createDecision({
            expectedValue: -25,
          });

        expect(
          createDecisionComparisonDelta(
            left,
            right,
          ).expectedValue,
        ).toBe(-125);
      },
    );

    it(
      "returns undefined when left optional metric is unavailable",
      () => {
        const left =
          createDecision({
            equity: undefined,
            expectedValue: undefined,
          });

        const right =
          createDecision();

        const delta =
          createDecisionComparisonDelta(
            left,
            right,
          );

        expect(
          delta.equity,
        ).toBeUndefined();

        expect(
          delta.expectedValue,
        ).toBeUndefined();
      },
    );

    it(
      "returns undefined when right optional metric is unavailable",
      () => {
        const left =
          createDecision();

        const right =
          createDecision({
            potOdds: undefined,
          });

        expect(
          createDecisionComparisonDelta(
            left,
            right,
          ).potOdds,
        ).toBeUndefined();
      },
    );

    it(
      "returns zero for equal values",
      () => {
        const left =
          createDecision();

        const right =
          createDecision();

        expect(
          createDecisionComparisonDelta(
            left,
            right,
          ),
        ).toEqual({
          expectedValue: 0,
          equity: 0,
          potOdds: 0,
          pot: 0,
          callAmount: 0,
        });
      },
    );
  },
);