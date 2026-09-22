import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  SessionDecision,
} from "./session-decisions";

import {
  createDecisionReviewKey,
  getDecisionReviewState,
  updateDecisionNote,
  updateDecisionReviewed,
} from "./decision-review-state";

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
    },
  };
}

describe(
  "decision review state",
  () => {
    it(
      "creates a stable key",
      () => {
        const decision =
          createDecision(
            "hand-1",
            4,
          );

        expect(
          createDecisionReviewKey(
            decision,
          ),
        ).toBe("hand-1:4");
      },
    );

    it(
      "returns default state",
      () => {
        const decision =
          createDecision(
            "hand-1",
            4,
          );

        expect(
          getDecisionReviewState(
            {},
            decision,
          ),
        ).toEqual({
          reviewed: false,
          note: "",
        });
      },
    );

    it(
      "updates reviewed state",
      () => {
        const decision =
          createDecision(
            "hand-1",
            4,
          );

        const states =
          updateDecisionReviewed(
            {},
            decision,
            true,
          );

        expect(
          getDecisionReviewState(
            states,
            decision,
          ),
        ).toEqual({
          reviewed: true,
          note: "",
        });
      },
    );

    it(
      "updates note without losing reviewed state",
      () => {
        const decision =
          createDecision(
            "hand-1",
            4,
          );

        const reviewed =
          updateDecisionReviewed(
            {},
            decision,
            true,
          );

        const states =
          updateDecisionNote(
            reviewed,
            decision,
            "Loose call on the flop",
          );

        expect(
          getDecisionReviewState(
            states,
            decision,
          ),
        ).toEqual({
          reviewed: true,
          note:
            "Loose call on the flop",
        });
      },
    );

    it(
      "keeps decisions isolated",
      () => {
        const first =
          createDecision(
            "hand-1",
            4,
          );

        const second =
          createDecision(
            "hand-2",
            4,
          );

        const states =
          updateDecisionReviewed(
            {},
            first,
            true,
          );

        expect(
          getDecisionReviewState(
            states,
            second,
          ).reviewed,
        ).toBe(false);
      },
    );
  },
);