import {
  describe,
  expect,
  it
} from "vitest";

import type {
  AnalysisReport,
  HandHistory
} from "@poker-vision/hand-history";

import {
  createHandReview
} from "@poker-vision/hand-review";

describe(
  "createHandReview",
  () => {
    const history: HandHistory = {
      id: "hand-1",

      gameFormat: "cash",

      smallBlind: 25,
      bigBlind: 50,
      ante: 0,

      players: [
        {
          id: "hero",
          name: "Hero",
          position: "BTN",
          startingStack: 5000,

          holeCards: [
            {
              rank: "A",
              suit: "spades"
            },
            {
              rank: "K",
              suit: "spades"
            }
          ]
        },
        {
          id: "villain",
          name: "Villain",
          position: "BB",
          startingStack: 5000
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
            },
            {
              playerId: "villain",
              type: "call",
              amount: 150,
              amountType: "total",
              street: "preflop"
            }
          ]
        },
        {
          street: "flop",

          board: [
            {
              rank: "2",
              suit: "clubs"
            },
            {
              rank: "7",
              suit: "diamonds"
            },
            {
              rank: "K",
              suit: "hearts"
            }
          ],

          actions: [
            {
              playerId: "villain",
              type: "check",
              amount: 0,
              amountType: "contribution",
              street: "flop"
            },
            {
              playerId: "hero",
              type: "bet",
              amount: 100,
              amountType: "total",
              street: "flop"
            }
          ]
        }
      ],

      startedAt: 10,
      completedAt: 30
    };

    const report: AnalysisReport = {
      handId: "hand-1",

      summary: {
        totalDecisionPoints: 2,
        analyzedDecisionPoints: 2,
        skippedDecisionPoints: 0,
        callDecisions: 0
      },

      decisions: [
        {
          actionIndex: 0,
          street: "preflop",
          action: "raise",
          amount: 125,
          pot: 75,
          callAmount: 25,
          status: "analyzed",
          equity: 0.64,
          expectedValue: 42.5,
          decision: "raise"
        },
        {
          actionIndex: 3,
          street: "flop",
          action: "bet",
          amount: 100,
          pot: 375,
          callAmount: 0,
          status: "analyzed",
          equity: 0.72,
          expectedValue: 68.25,
          decision: "bet"
        }
      ]
    };

    it(
      "combines hand history and analysis into a review model",
      () => {
        const review =
          createHandReview(
            history,
            report
          );

        expect(review.id).toBe(
          "hand-1"
        );

        expect(review.blinds).toEqual({
          smallBlind: 25,
          bigBlind: 50,
          ante: 0
        });

        expect(
          review.players[0]?.holeCards
        ).toEqual([
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "spades"
          }
        ]);

        expect(
          review.streets[1]?.board
        ).toEqual([
          {
            rank: "2",
            suit: "clubs"
          },
          {
            rank: "7",
            suit: "diamonds"
          },
          {
            rank: "K",
            suit: "hearts"
          }
        ]);

        expect(
          review.streets.flatMap(
            street =>
              street.actions.map(
                action =>
                  action.actionIndex
              )
          )
        ).toEqual([
          0,
          1,
          2,
          3
        ]);

        expect(
          review.decisions.map(
            ({
               state: _state,
               ...decision
             }) => decision
          )
        ).toEqual(
          report.decisions
        );

        expect(
          review.decisions[0]?.state
        ).toMatchObject({
          street: "preflop",
          board: [],
          pot: 0,
          currentBet: 0,

          playerContributions: {
            hero: 0,
            villain: 0
          },

          totalContributions: {
            hero: 0,
            villain: 0
          }
        });

        expect(
          review.decisions[1]?.state
        ).toMatchObject({
          street: "flop",

          board: [
            {
              rank: "2",
              suit: "clubs"
            },
            {
              rank: "7",
              suit: "diamonds"
            },
            {
              rank: "K",
              suit: "hearts"
            }
          ],

          pot: 300,
          currentBet: 0,

          playerContributions: {
            hero: 0,
            villain: 0
          },

          totalContributions: {
            hero: 150,
            villain: 150
          }
        });

        expect(
          review.decisions[1]?.state
            ?.players.map(
            player => ({
              id: player.id,
              stack: player.stack
            })
          )
        ).toEqual([
          {
            id: "hero",
            stack: 4850
          },
          {
            id: "villain",
            stack: 4850
          }
        ]);

        expect(
          review.startedAt
        ).toBe(10);

        expect(
          review.completedAt
        ).toBe(30);
      }
    );

    it(
      "rejects mismatched hand IDs",
      () => {
        expect(
          () =>
            createHandReview(
              history,
              {
                ...report,
                handId:
                  "different-hand"
              }
            )
        ).toThrow(
          "Hand ID mismatch"
        );
      }
    );
  }
);