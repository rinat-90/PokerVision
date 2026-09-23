import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  HandReview,
} from "@poker-vision/hand-review";

import {
  createSessionResults,
} from "./session-results";

import type {
  ReviewSession,
} from "./review-session";

function createCompletedHand(
  id: string,
  contribution: number,
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
            playerId: "villain",
            street: "river",
            type: "fold",
            amount: 0,

            state: {
              street: "river",
              board: [],
              players: [],

              pot:
                contribution * 2,

              currentBet: 0,
              minimumRaise: 100,

              playerContributions: {
                hero: 0,
                villain: 0,
              },

              totalContributions: {
                hero: contribution,
                villain: contribution,
              },
            },
          },
        ],
      },
    ],

    decisions: [],

    summary: {
      totalDecisionPoints: 0,
      analyzedDecisionPoints: 0,
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

function createUnresolvedHand(
  id: string,
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

    summary: {
      totalDecisionPoints: 0,
      analyzedDecisionPoints: 0,
      skippedDecisionPoints: 0,
      callDecisions: 0,
    },
  };
}

describe("createSessionResults", () => {
  it("returns an empty result for an empty session", () => {
    const session: ReviewSession = {
      hands: [],
      selectedHandId: null,
    };

    expect(
      createSessionResults(session),
    ).toEqual([]);
  });

  it("creates hand results with cumulative profit and loss", () => {
    const session: ReviewSession = {
      hands: [
        createCompletedHand(
          "100001",
          1000,
          2500,
        ),

        createCompletedHand(
          "100002",
          500,
          0,
        ),

        createCompletedHand(
          "100003",
          750,
          2000,
        ),
      ],

      selectedHandId: "100003",
    };

    expect(
      createSessionResults(session),
    ).toEqual([
      {
        handId: "100001",
        netResult: 1500,
        cumulativeNetResult: 1500,
      },
      {
        handId: "100002",
        netResult: -500,
        cumulativeNetResult: 1000,
      },
      {
        handId: "100003",
        netResult: 1250,
        cumulativeNetResult: 2250,
      },
    ]);
  });

  it("skips unresolved hands without treating them as zero", () => {
    const session: ReviewSession = {
      hands: [
        createCompletedHand(
          "100001",
          1000,
          2500,
        ),

        createUnresolvedHand(
          "unresolved",
        ),

        createCompletedHand(
          "100003",
          500,
          0,
        ),
      ],

      selectedHandId: "100003",
    };

    expect(
      createSessionResults(session),
    ).toEqual([
      {
        handId: "100001",
        netResult: 1500,
        cumulativeNetResult: 1500,
      },
      {
        handId: "100003",
        netResult: -500,
        cumulativeNetResult: 1000,
      },
    ]);
  });
});