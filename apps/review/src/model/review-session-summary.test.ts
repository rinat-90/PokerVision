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
    heroPlayerId: "hero",

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

function createCompletedHand(
  id: string,
  payout: number,
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

    players: [
      {
        id: "hero",
        name: "Hero",
        position: "BTN",
        startingStack: 10000,
      },
      {
        id: "villain",
        name: "Villain",
        position: "BB",
        startingStack: 10000,
      },
    ],

    streets: [
      {
        street: "river",
        board: [],

        actions: [
          {
            actionIndex: 1,
            playerId: "hero",
            street: "river",
            type: "bet",
            amount: 1000,

            state: {
              street: "river",
              board: [],
              players: [],

              pot: 1000,
              currentBet: 0,
              minimumRaise: 100,

              playerContributions: {
                hero: 0,
                villain: 0,
              },

              totalContributions: {
                hero: 0,
                villain: 1000,
              },
            },
          },
        ],
      },
    ],

    decisions: [],

    summary: {
      totalDecisionPoints: 1,
      analyzedDecisionPoints: 1,
      skippedDecisionPoints: 0,
      callDecisions: 0,
    },

    showdown: {
      players: [],

      payouts:
        payout > 0
          ? [
            {
              playerId: "hero",
              amount: payout,
            },
          ]
          : [],
    },
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
      completedHands: 0,
      totalNetResult: 0,
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
      completedHands: 0,
      totalNetResult: 0,
    });
  });

  it("aggregates hero profit and loss across completed hands", () => {
    const session: ReviewSession = {
      hands: [
        createCompletedHand(
          "win",
          2500,
        ),
        createCompletedHand(
          "loss",
          0,
        ),
      ],

      selectedHandId: "win",
    };

    const summary =
      createReviewSessionSummary(
        session,
      );

    expect(
      summary.completedHands,
    ).toBe(2);

    expect(
      summary.totalNetResult,
    ).toBe(500);
  });
});