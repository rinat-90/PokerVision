import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  HandReview,
} from "@poker-vision/hand-review";

import type {
  ReviewSession,
} from "./review-session";

import {
  createReviewDecisionQuality,
} from "./review-decision-quality";

function createHand(
  id: string,
  decisions: HandReview["decisions"],
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
    decisions,
    summary: {
      totalDecisionPoints:
      decisions.length,
      analyzedDecisionPoints:
      decisions.filter(
        (decision) =>
          decision.status === "analyzed",
      ).length,
      skippedDecisionPoints:
      decisions.filter(
        (decision) =>
          decision.status === "skipped",
      ).length,
      callDecisions:
      decisions.filter(
        (decision) =>
          decision.action === "call",
      ).length,
    },
  };
}

describe("createReviewDecisionQuality", () => {
  it("returns empty quality for an empty session", () => {
    const session: ReviewSession = {
      hands: [],
      selectedHandId: null,
    };

    expect(
      createReviewDecisionQuality(
        session,
      ),
    ).toEqual({
      analyzedDecisions: 0,
      positiveEvDecisions: 0,
      negativeEvDecisions: 0,
      neutralEvDecisions: 0,
      totalExpectedValue: 0,
      averageExpectedValue: null,
    });
  });

  it("aggregates expected value across analyzed decisions", () => {
    const session: ReviewSession = {
      hands: [
        createHand(
          "100000",
          [
            {
              actionIndex: 0,
              street: "preflop",
              action: "call",
              amount: 100,
              pot: 150,
              callAmount: 50,
              status: "analyzed",
              expectedValue: 40,
            },
            {
              actionIndex: 1,
              street: "flop",
              action: "call",
              amount: 200,
              pot: 400,
              callAmount: 200,
              status: "analyzed",
              expectedValue: -20,
            },
          ],
        ),
        createHand(
          "100001",
          [
            {
              actionIndex: 0,
              street: "turn",
              action: "call",
              amount: 300,
              pot: 900,
              callAmount: 300,
              status: "analyzed",
              expectedValue: 0,
            },
            {
              actionIndex: 1,
              street: "river",
              action: "fold",
              amount: 0,
              pot: 1200,
              callAmount: 400,
              status: "skipped",
              skipReason:
                "action_not_supported",
            },
            {
              actionIndex: 2,
              street: "river",
              action: "call",
              amount: 400,
              pot: 1200,
              callAmount: 400,
              status: "analyzed",
            },
          ],
        ),
      ],
      selectedHandId: "100001",
    };

    expect(
      createReviewDecisionQuality(
        session,
      ),
    ).toEqual({
      analyzedDecisions: 3,
      positiveEvDecisions: 1,
      negativeEvDecisions: 1,
      neutralEvDecisions: 1,
      totalExpectedValue: 20,
      averageExpectedValue:
        20 / 3,
    });
  });
});