import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  HandReview,
} from "@poker-vision/hand-review";

import {
  createReviewSessionSummary,
} from "./review-session-summary";

import type {
  ReviewSession,
} from "./review-session";

function createHand(
  id: string,
  summary: HandReview["summary"],
): HandReview {
  return {
    id,
    gameFormat: "cash",
    blinds: {
      smallBlind: 50,
      bigBlind: 100,
      ante: 0,
    },
    players: [],
    streets: [],
    decisions: [],
    summary,
  };
}

describe("createReviewSessionSummary", () => {
  it("returns zero totals for an empty session", () => {
    const session: ReviewSession = {
      hands: [],
      selectedHandId: null,
    };

    expect(
      createReviewSessionSummary(
        session,
      ),
    ).toEqual({
      totalHands: 0,
      totalDecisionPoints: 0,
      analyzedDecisionPoints: 0,
      skippedDecisionPoints: 0,
      callDecisions: 0,
    });
  });

  it("aggregates summaries across hands", () => {
    const session: ReviewSession = {
      hands: [
        createHand(
          "100000",
          {
            totalDecisionPoints: 4,
            analyzedDecisionPoints: 4,
            skippedDecisionPoints: 0,
            callDecisions: 2,
          },
        ),
        createHand(
          "100001",
          {
            totalDecisionPoints: 3,
            analyzedDecisionPoints: 1,
            skippedDecisionPoints: 2,
            callDecisions: 1,
          },
        ),
      ],
      selectedHandId: "100001",
    };

    expect(
      createReviewSessionSummary(
        session,
      ),
    ).toEqual({
      totalHands: 2,
      totalDecisionPoints: 7,
      analyzedDecisionPoints: 5,
      skippedDecisionPoints: 2,
      callDecisions: 3,
    });
  });
});