import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  HandReview,
} from "@poker-vision/hand-review";

import type {
  SessionDecision,
} from "./session-decisions";

import {
  getDecisionContext,
} from "./decision-context";

function createSessionDecision(
  actionIndex = 3,
): SessionDecision {
  return {
    handId: "100000",
    decision: {
      actionIndex,
      street: "flop",
      action: "call",
      amount: 100,
      pot: 500,
      callAmount: 100,
      status: "analyzed",
    },
  };
}

function createReview(): HandReview {
  return {
    id: "100000",

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
            actionIndex: 3,
            playerId: "hero",
            street: "flop",
            type: "call",
            amount: 100,
            state: {
              street: "flop",
              board: [],
              players: [],
              pot: 500,
              currentBet: 100,
              minimumRaise: 200,
              playerContributions: {},
              totalContributions: {},
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
  };
}

describe(
  "getDecisionContext",
  () => {
    it(
      "finds the player for a decision action",
      () => {
        const context =
          getDecisionContext(
            createSessionDecision(),
            createReview(),
          );

        expect(
          context.playerId,
        ).toBe("hero");

        expect(
          context.player?.name,
        ).toBe("Hero");

        expect(
          context.player?.position,
        ).toBe("BTN");
      },
    );

    it(
      "returns empty context when action is missing",
      () => {
        expect(
          getDecisionContext(
            createSessionDecision(999),
            createReview(),
          ),
        ).toEqual({});
      },
    );
  },
);