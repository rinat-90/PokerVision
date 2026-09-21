import {
  describe,
  expect,
  it
} from "vitest";

import type {
  HandHistory
} from "./types.js";

import {
  replayHandToAction
} from "./replay-hand.js";

describe(
  "replayHandToAction",
  () => {
    it(
      "normalizes total preflop amounts against forced blinds",
      () => {
        const hand: HandHistory = {
          id: "forced-blind-total",
          gameFormat: "cash",

          smallBlind: 25,
          bigBlind: 50,
          ante: 0,

          players: [
            {
              id: "hero",
              name: "Hero",
              position: "BTN",
              startingStack: 5000
            },
            {
              id: "villain",
              name: "Villain",
              position: "BB",
              startingStack: 5000
            }
          ],

          forcedBets: [
            {
              playerId: "hero",
              type: "small_blind",
              amount: 25
            },
            {
              playerId: "villain",
              type: "big_blind",
              amount: 50
            }
          ],

          streets: [
            {
              street: "preflop",
              board: [],
              actions: [
                {
                  playerId: "hero",
                  type: "call",
                  amount: 100,
                  amountType: "total",
                  street: "preflop"
                },
                {
                  playerId: "villain",
                  type: "check",
                  amount: 0,
                  amountType: "total",
                  street: "preflop"
                }
              ]
            }
          ]
        };

        const beforeCall =
          replayHandToAction(
            hand,
            0
          );

        expect(
          beforeCall.pot
        ).toBe(75);

        expect(
          beforeCall.currentBet
        ).toBe(50);

        expect(
          beforeCall.playerContributions
        ).toEqual({
          hero: 25,
          villain: 50
        });

        const afterCall =
          replayHandToAction(
            hand,
            1
          );

        expect(
          afterCall.pot
        ).toBe(150);

        expect(
          afterCall.currentBet
        ).toBe(100);

        expect(
          afterCall.playerContributions
        ).toEqual({
          hero: 100,
          villain: 50
        });

        expect(
          afterCall.totalContributions
        ).toEqual({
          hero: 100,
          villain: 50
        });
      }
    );
    it(
      "normalizes a total raise amount in the target action",
      () => {
        const hand: HandHistory = {
          id: "total-raise",
          gameFormat: "cash",
          smallBlind: 25,
          bigBlind: 50,
          ante: 0,

          players: [
            {
              id: "hero",
              name: "Hero",
              position: "BTN",
              startingStack: 5000
            },
            {
              id: "villain",
              name: "Villain",
              position: "BB",
              startingStack: 5000
            }
          ],

          forcedBets: [
            {
              playerId: "hero",
              type: "small_blind",
              amount: 25
            },
            {
              playerId: "villain",
              type: "big_blind",
              amount: 50
            }
          ],

          streets: [
            {
              street: "preflop",
              board: [],

              actions: [
                {
                  playerId: "hero",
                  type: "raise",
                  amount: 150,
                  amountType: "total",
                  street: "preflop"
                }
              ]
            }
          ]
        };

        const snapshot =
          replayHandToAction(
            hand,
            0
          );

        expect(
          snapshot.playerContributions
        ).toEqual({
          hero: 25,
          villain: 50
        });

        expect(
          snapshot.targetAction
        ).toEqual({
          playerId: "hero",
          type: "raise",
          amount: 125,
          street: "preflop"
        });
      }
    );
  }
);
