import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createDecisionReviewKey,
} from "./decision-review-state";

import type {
  DecisionReviewStateMap,
} from "./decision-review-state";

import {
  filterSessionDecisionsByReview,
} from "./session-review-filter";

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
  "session review filter",
  () => {
    const decisions = [
      createDecision("100001", 2),
      createDecision("100001", 5),
      createDecision("100002", 3),
      createDecision("100003", 4),
    ];

    const states: DecisionReviewStateMap = {
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

    it("returns all decisions", () => {
      expect(
        filterSessionDecisionsByReview(
          decisions,
          states,
          "all",
        ),
      ).toEqual(decisions);
    });

    it("returns only unreviewed decisions", () => {
      expect(
        filterSessionDecisionsByReview(
          decisions,
          states,
          "unreviewed",
        ),
      ).toEqual([
        decisions[1],
        decisions[3],
      ]);
    });

    it("returns only reviewed decisions", () => {
      expect(
        filterSessionDecisionsByReview(
          decisions,
          states,
          "reviewed",
        ),
      ).toEqual([
        decisions[0],
        decisions[2],
      ]);
    });

    it("treats missing review state as unreviewed", () => {
      expect(
        filterSessionDecisionsByReview(
          decisions,
          {},
          "unreviewed",
        ),
      ).toEqual(decisions);

      expect(
        filterSessionDecisionsByReview(
          decisions,
          {},
          "reviewed",
        ),
      ).toEqual([]);
    });
  },
);