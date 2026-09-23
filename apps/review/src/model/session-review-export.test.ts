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
  createDecisionReviewKey,
} from "./decision-review-state";

import type {
  DecisionReviewStateMap,
} from "./decision-review-state";

import {
  createSessionReviewExport,
  serializeSessionReviewExport,
} from "./session-review-export";

import {
  getSessionDecisions,
} from "./session-decisions";

function createHand(): HandReview {
  return {
    id: "100001",
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
        street: "flop",
        board: [],

        actions: [
          {
            actionIndex: 1,
            playerId: "hero",
            street: "flop",
            type: "call",
            amount: 500,

            state: {
              street: "flop",
              board: [],
              players: [],

              pot: 1500,
              currentBet: 500,
              minimumRaise: 100,

              playerContributions: {
                hero: 500,
                villain: 500,
              },

              totalContributions: {
                hero: 1000,
                villain: 1000,
              },
            },
          },
        ],
      },
    ],

    decisions: [
      {
        actionIndex: 1,
        street: "flop",
        action: "call",
        status: "analyzed",
      },
    ] as HandReview["decisions"],

    summary: {
      totalDecisionPoints: 1,
      analyzedDecisionPoints: 1,
      skippedDecisionPoints: 0,
      callDecisions: 1,
    },

    showdown: {
      players: [],

      payouts: [
        {
          playerId: "hero",
          amount: 2500,
        },
      ],
    },
  };
}

describe(
  "session review export",
  () => {
    it("exports session data and review state", () => {
      const hand = createHand();

      const session: ReviewSession = {
        hands: [hand],
        selectedHandId: hand.id,
      };

      const [decision] =
        getSessionDecisions(session);

      const states: DecisionReviewStateMap = {
        [createDecisionReviewKey(
          decision,
        )]: {
          reviewed: true,
          note: "Check pot odds",
        },
      };

      const result =
        createSessionReviewExport(
          session,
          states,
          "2026-09-22T12:00:00.000Z",
        );

      expect(result.version).toBe(1);

      expect(result.exportedAt).toBe(
        "2026-09-22T12:00:00.000Z",
      );

      expect(result.summary).toEqual({
        totalHands: 1,
        totalDecisionPoints: 1,
        analyzedDecisionPoints: 1,
        skippedDecisionPoints: 0,
        callDecisions: 1,
        completedHands: 1,
        totalNetResult: 1000,
      });

      expect(result.results).toEqual([
        {
          handId: "100001",
          netResult: 1000,
          cumulativeNetResult: 1000,
        },
      ]);

      expect(result.results).toEqual([
        {
          handId: "100001",
          netResult: 1000,
          cumulativeNetResult: 1000,
        },
      ]);

      expect(result.decisions).toEqual([
        {
          handId: "100001",
          actionIndex: 1,
          street: "flop",
          action: "call",
          reviewed: true,
          note: "Check pot odds",
        },
      ]);

      expect(result.hands).toEqual([
        hand,
      ]);
    });

    it("exports missing review state as unreviewed", () => {
      const hand = createHand();

      const session: ReviewSession = {
        hands: [hand],
        selectedHandId: hand.id,
      };

      const result =
        createSessionReviewExport(
          session,
          {},
          "2026-09-22T12:00:00.000Z",
        );

      expect(
        result.decisions[0],
      ).toMatchObject({
        reviewed: false,
        note: "",
      });
    });

    it("serializes export as formatted JSON", () => {
      const session: ReviewSession = {
        hands: [],
        selectedHandId: null,
      };

      const reviewExport =
        createSessionReviewExport(
          session,
          {},
          "2026-09-22T12:00:00.000Z",
        );

      const serialized =
        serializeSessionReviewExport(
          reviewExport,
        );

      expect(
        JSON.parse(serialized),
      ).toEqual(reviewExport);

      expect(serialized).toContain(
        '\n  "version": 1',
      );
    });
  },
);