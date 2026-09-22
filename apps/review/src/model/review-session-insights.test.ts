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
  createReviewSessionInsights,
} from "./review-session-insights";

function createHand(
  id: string,
  decisions: HandReview["decisions"],
): HandReview {
  return {
    id,
    heroPlayerId: "hero",
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
          decision.status ===
          "analyzed",
      ).length,
      skippedDecisionPoints:
      decisions.filter(
        (decision) =>
          decision.status ===
          "skipped",
      ).length,
      callDecisions:
      decisions.filter(
        (decision) =>
          decision.action ===
          "call",
      ).length,
    },
  };
}

describe("createReviewSessionInsights", () => {
  it("returns empty insights for an empty session", () => {
    const session: ReviewSession = {
      hands: [],
      selectedHandId: null,
    };

    expect(
      createReviewSessionInsights(
        session,
      ),
    ).toEqual({
      actions: {},
      streets: {},
      analyzed: 0,
      skipped: 0,
    });
  });

  it("aggregates decisions across hands", () => {
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
            },
            {
              actionIndex: 1,
              street: "flop",
              action: "fold",
              amount: 0,
              pot: 300,
              callAmount: 100,
              status: "skipped",
              skipReason:
                "action_not_supported",
            },
          ],
        ),
        createHand(
          "100001",
          [
            {
              actionIndex: 0,
              street: "preflop",
              action: "call",
              amount: 100,
              pot: 150,
              callAmount: 50,
              status: "analyzed",
            },
            {
              actionIndex: 1,
              street: "turn",
              action: "raise",
              amount: 600,
              pot: 800,
              callAmount: 200,
              status: "analyzed",
            },
          ],
        ),
      ],
      selectedHandId: "100001",
    };

    expect(
      createReviewSessionInsights(
        session,
      ),
    ).toEqual({
      actions: {
        call: 2,
        fold: 1,
        raise: 1,
      },
      streets: {
        preflop: 2,
        flop: 1,
        turn: 1,
      },
      analyzed: 3,
      skipped: 1,
    });
  });
});