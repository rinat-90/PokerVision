import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  DecisionReviewStateMap,
} from "./decision-review-state";

import {
  createDecisionReviewKey,
} from "./decision-review-state";

import {
  createSessionReviewCompletion,
  getNextUnreviewedDecision,
} from "./session-review-completion";

import type {
  SessionDecision,
} from "./session-decisions";

function createDecision(
  handId: string,
  actionIndex: number,
): SessionDecision {
  return {
    handId,
    decision: {
      actionIndex,
    },
  } as SessionDecision;
}

describe(
  "session review completion",
  () => {
    const decisions = [
      createDecision("100001", 2),
      createDecision("100001", 5),
      createDecision("100002", 3),
      createDecision("100003", 4),
    ];

    it("returns empty completion", () => {
      expect(
        createSessionReviewCompletion(
          [],
          {},
        ),
      ).toEqual({
        totalDecisions: 0,
        reviewedDecisions: 0,
        remainingDecisions: 0,
        progress: 0,
      });
    });

    it("calculates review progress", () => {
      const states: DecisionReviewStateMap =
        {
          [createDecisionReviewKey(
            decisions[0],
          )]: {
            reviewed: true,
            note: "",
          },

          [createDecisionReviewKey(
            decisions[2],
          )]: {
            reviewed: true,
            note: "",
          },
        };

      expect(
        createSessionReviewCompletion(
          decisions,
          states,
        ),
      ).toEqual({
        totalDecisions: 4,
        reviewedDecisions: 2,
        remainingDecisions: 2,
        progress: 50,
      });
    });

    it("finds the next unreviewed decision", () => {
      const states: DecisionReviewStateMap =
        {
          [createDecisionReviewKey(
            decisions[1],
          )]: {
            reviewed: true,
            note: "",
          },
        };

      expect(
        getNextUnreviewedDecision(
          decisions,
          states,
          decisions[0],
        ),
      ).toBe(decisions[2]);
    });

    it("wraps to the beginning", () => {
      const states: DecisionReviewStateMap =
        {
          [createDecisionReviewKey(
            decisions[3],
          )]: {
            reviewed: true,
            note: "",
          },
        };

      expect(
        getNextUnreviewedDecision(
          decisions,
          states,
          decisions[2],
        ),
      ).toBe(decisions[0]);
    });

    it("starts from the first unreviewed decision when current is null", () => {
      const states: DecisionReviewStateMap =
        {
          [createDecisionReviewKey(
            decisions[0],
          )]: {
            reviewed: true,
            note: "",
          },
        };

      expect(
        getNextUnreviewedDecision(
          decisions,
          states,
          null,
        ),
      ).toBe(decisions[1]);
    });

    it("returns null when everything is reviewed", () => {
      const states =
        Object.fromEntries(
          decisions.map(
            (decision) => [
              createDecisionReviewKey(
                decision,
              ),
              {
                reviewed: true,
                note: "",
              },
            ],
          ),
        );

      expect(
        getNextUnreviewedDecision(
          decisions,
          states,
          decisions[0],
        ),
      ).toBeNull();
    });
  },
);