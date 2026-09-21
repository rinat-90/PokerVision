import {
  describe,
  expect,
  it
} from "vitest";

import {
  findDecisionPoints,
  replayHandToAction,
  validateHandHistory
} from "@poker-vision/hand-history";

import type {
  VideoHand
} from "./video-hand.js";

import {
  videoHandToHandHistory
} from "./video-hand-to-hand-history.js";

describe(
  "videoHandToHandHistory",
  () => {
    it(
      "converts a reconstructed video hand into hand history",
      () => {
        const hand: VideoHand = {
          startedAt: 10,
          completedAt: 30,

          players: [
            {
              seatIndex: 0,
              hasCards: true
            },
            {
              seatIndex: 1,
              hasCards: true
            }
          ],

          streets: [
            {
              street: "flop",

              board: [
                {
                  rank: "2",
                  suit: "hearts",
                  rankConfidence: 0.98,
                  suitConfidence: 0.99,
                  confidence: 0.98
                },
                {
                  rank: "6",
                  suit: "hearts",
                  rankConfidence: 0.97,
                  suitConfidence: 0.99,
                  confidence: 0.97
                },
                {
                  rank: "5",
                  suit: "hearts",
                  rankConfidence: 0.96,
                  suitConfidence: 0.98,
                  confidence: 0.96
                }
              ],

              timestampSeconds: 20
            }
          ],

          actions: [
            {
              seatIndex: 0,
              street: "preflop",
              type: "call",
              amount: 100,
              timestampSeconds: 12
            },
            {
              seatIndex: 1,
              street: "preflop",
              type: "check",
              amount: null,
              timestampSeconds: 13
            },
            {
              seatIndex: 1,
              street: "flop",
              type: "check",
              amount: null,
              timestampSeconds: 21
            },
            {
              seatIndex: 0,
              street: "flop",
              type: "bet",
              amount: 200,
              timestampSeconds: 22
            },
            {
              seatIndex: 1,
              street: "flop",
              type: "fold",
              amount: null,
              timestampSeconds: 23
            }
          ]
        };

        const result =
          videoHandToHandHistory(
            hand,
            {
              handId:
                "video-hand-1",

              gameFormat:
                "cash",

              smallBlind: 25,
              bigBlind: 50,

              players: [
                {
                  seatIndex: 0,
                  playerId: "hero",
                  name: "Hero",
                  position: "BTN",
                  startingStack: 5000
                },
                {
                  seatIndex: 1,
                  playerId: "villain",
                  name: "Villain",
                  position: "BB",
                  startingStack: 5000
                }
              ]
            }
          );

        expect(result.id).toBe(
          "video-hand-1"
        );

        expect(result.startedAt).toBe(10);
        expect(result.completedAt).toBe(30);

        expect(result.smallBlind).toBe(25);
        expect(result.bigBlind).toBe(50);
        expect(result.ante).toBe(0);

        expect(result.players).toEqual([
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
        ]);

        expect(result.forcedBets).toEqual([
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
        ]);

        expect(result.streets).toHaveLength(
          2
        );

        expect(
          result.streets[0]
        ).toEqual({
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
        });

        expect(
          result.streets[1]
        ).toEqual({
          street: "flop",
          board: [
            {
              rank: "2",
              suit: "hearts"
            },
            {
              rank: "6",
              suit: "hearts"
            },
            {
              rank: "5",
              suit: "hearts"
            }
          ],
          actions: [
            {
              playerId: "villain",
              type: "check",
              amount: 0,
              amountType: "total",
              street: "flop"
            },
            {
              playerId: "hero",
              type: "bet",
              amount: 200,
              amountType: "total",
              street: "flop"
            },
            {
              playerId: "villain",
              type: "fold",
              amount: 0,
              amountType: "total",
              street: "flop"
            }
          ]
        });

        expect(
          () => validateHandHistory(result)
        ).not.toThrow();

        const preflopSnapshot =
          replayHandToAction(
            result,
            0
          );

        expect(
          preflopSnapshot.pot
        ).toBe(75);

        expect(
          preflopSnapshot.currentBet
        ).toBe(50);

        expect(
          preflopSnapshot.playerContributions
        ).toEqual({
          hero: 25,
          villain: 50
        });

        expect(
          preflopSnapshot.totalContributions
        ).toEqual({
          hero: 25,
          villain: 50
        });

        expect(
          preflopSnapshot.targetAction
        ).toEqual({
          playerId: "hero",
          type: "call",
          amount: 100,
          street: "preflop"
        });

        const afterHeroCall =
          replayHandToAction(
            result,
            1
          );

        expect(
          afterHeroCall.pot
        ).toBe(150);

        expect(
          afterHeroCall.currentBet
        ).toBe(100);

        expect(
          afterHeroCall.playerContributions
        ).toEqual({
          hero: 100,
          villain: 50
        });

        expect(
          afterHeroCall.totalContributions
        ).toEqual({
          hero: 100,
          villain: 50
        });

        expect(
          afterHeroCall.targetAction
        ).toEqual({
          playerId: "villain",
          type: "check",
          amount: 0,
          street: "preflop"
        });

        const heroDecisionPoints =
          findDecisionPoints(
            result,
            {
              playerId: "hero"
            }
          );

        expect(
          heroDecisionPoints
        ).toEqual([
          {
            actionIndex: 0,

            playerId:
              "hero",

            street:
              "preflop",

            action: {
              playerId:
                "hero",

              type:
                "call",

              amount:
                100,

              street:
                "preflop"
            }
          },
          {
            actionIndex: 3,

            playerId:
              "hero",

            street:
              "flop",

            action: {
              playerId:
                "hero",

              type:
                "bet",

              amount:
                200,

              street:
                "flop"
            }
          }
        ]);
      }
    );

    it(
      "skips amount actions when the amount is unknown",
      () => {
        const hand: VideoHand = {
          startedAt: null,
          completedAt: 20,

          players: [
            {
              seatIndex: 0,
              hasCards: true
            }
          ],

          streets: [],

          actions: [
            {
              seatIndex: 0,
              street: "preflop",
              type: "call",
              amount: null,
              timestampSeconds: 5
            },
            {
              seatIndex: 0,
              street: "preflop",
              type: "fold",
              amount: null,
              timestampSeconds: 6
            }
          ]
        };

        const result =
          videoHandToHandHistory(
            hand,
            {
              handId: "partial-hand",
              gameFormat: "cash",
              smallBlind: 25,
              bigBlind: 50,

              players: [
                {
                  seatIndex: 0,
                  playerId: "hero",
                  name: "Hero",
                  position: "BTN",
                  startingStack: 5000
                }
              ]
            }
          );

        expect(
          result.streets[0]?.actions
        ).toEqual([
          {
            playerId: "hero",
            type: "fold",
            amount: 0,
            amountType: "total",
            street: "preflop"
          }
        ]);

        expect(
          result.startedAt
        ).toBeUndefined();

        expect(
          result.completedAt
        ).toBe(20);
      }
    );

    it(
      "throws when player metadata is missing",
      () => {
        const hand: VideoHand = {
          startedAt: 0,
          completedAt: 10,

          players: [
            {
              seatIndex: 4,
              hasCards: true
            }
          ],

          streets: [],
          actions: []
        };

        expect(
          () =>
            videoHandToHandHistory(
              hand,
              {
                handId: "hand-1",
                gameFormat: "cash",
                smallBlind: 25,
                bigBlind: 50,
                players: []
              }
            )
        ).toThrow(
          "Missing metadata for seat 4"
        );
      }
    );
  }
);