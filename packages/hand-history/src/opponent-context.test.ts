import {
  describe,
  expect,
  it
} from "vitest";

import {
  createOpponentContext
} from "./opponent-context.js";

import type {
  HandStateSnapshot
} from "./replay-hand.js";

import {
  createRange
} from "@poker-vision/poker-engine";

describe(
  "createOpponentContext",
  () => {
    it(
      "creates opponents from active players",
      () => {
        const range =
          createRange([
            "QQ",
            "JJ",
            "AK"
          ]);

        const snapshot =
          {
            actionIndex: 3,

            targetAction: {
              playerId: "hero",
              type: "call",
              amount: 50,
              street: "flop"
            },

            players: [
              {
                id: "hero",
                name: "Hero",
                position: "BTN",
                stack: 900,
                status: "active"
              },
              {
                id: "villain",
                name: "Villain",
                position: "BB",
                stack: 900,
                status: "active"
              },
              {
                id: "folded",
                name: "Folded",
                position: "UTG",
                stack: 900,
                status: "folded"
              }
            ],

            street: "flop",

            board: [],

            playersToAct: [],

            currentPlayerId: "hero",

            bettingRoundComplete: false,

            pot: 100,

            currentBet: 50,

            minimumRaise: 100,

            playerContributions: {
              hero: 0,
              villain: 50,
              folded: 0
            },

            totalContributions: {
              hero: 100,
              villain: 100,
              folded: 50
            },

            actions: []
          } as HandStateSnapshot;

        const result =
          createOpponentContext(
            snapshot,
            {
              heroPlayerId: "hero",
              villainRange: range
            }
          );

        expect(
          result.heroPlayerId
        ).toBe("hero");

        expect(
          result.opponents
        ).toHaveLength(1);

        expect(
          result.opponents[0]
        ).toEqual({
          playerId: "villain",
          playerName: "Villain",
          position: "BB",
          stack: 900,
          status: "active",
          range
        });
      }
    );
  }
);