import {
  describe,
  expect,
  it
} from "vitest";

import {
  createRange
} from "@poker-vision/poker-engine";

import {
  analyzeHandHistory
} from "./analyze-hand-history.js";

import type {
  HandHistory
} from "./types.js";

describe(
  "analyzeHandHistory",
  () => {
    it(
      "analyzes all supported decision types",
      () => {
        const hand: HandHistory = {
          id: "all-actions-hand",
          gameFormat: "cash",
          smallBlind: 1,
          bigBlind: 2,
          ante: 0,

          players: [
            {
              id: "hero",
              name: "Hero",
              position: "BTN",
              startingStack: 500,
              holeCards: [
                {
                  rank: "A",
                  suit: "hearts"
                },
                {
                  rank: "A",
                  suit: "diamonds"
                }
              ]
            },
            {
              id: "villain",
              name: "Villain",
              position: "BB",
              startingStack: 500
            }
          ],

          forcedBets: [
            {
              playerId: "hero",
              type: "small_blind",
              amount: 1
            },
            {
              playerId: "villain",
              type: "big_blind",
              amount: 2
            }
          ],

          streets: [
            {
              street: "preflop",
              board: [],
              actions: [
                {
                  playerId: "villain",
                  type: "check",
                  amount: 0,
                  amountType: "contribution",
                  street: "preflop"
                },
                {
                  playerId: "hero",
                  type: "call",
                  amount: 1,
                  amountType: "contribution",
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
                  suit: "spades"
                }
              ],
              actions: [
                {
                  playerId: "hero",
                  type: "bet",
                  amount: 10,
                  amountType: "contribution",
                  street: "flop"
                },
                {
                  playerId: "villain",
                  type: "call",
                  amount: 10,
                  amountType: "contribution",
                  street: "flop"
                }
              ]
            },

            {
              street: "turn",
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
                  suit: "spades"
                },
                {
                  rank: "3",
                  suit: "hearts"
                }
              ],
              actions: [
                {
                  playerId: "villain",
                  type: "check",
                  amount: 0,
                  amountType: "contribution",
                  street: "turn"
                },
                {
                  playerId: "hero",
                  type: "raise",
                  amount: 20,
                  amountType: "contribution",
                  street: "turn"
                },
                {
                  playerId: "villain",
                  type: "call",
                  amount: 20,
                  amountType: "contribution",
                  street: "turn"
                }
              ]
            }
          ]
        };

        const villainRange =
          createRange([
            "QQ",
            "JJ",
            "TT",
            "AK"
          ]);

        const result =
          analyzeHandHistory(
            hand,
            {
              heroPlayerId: "hero",
              villainRange
            }
          );

        expect(
          result.handId
        ).toBe(
          "all-actions-hand"
        );

        expect(
          result.decisions
        ).toHaveLength(
          3
        );

        expect(
          result.summary.totalDecisionPoints
        ).toBe(
          3
        );

        expect(
          result.summary.analyzedDecisionPoints
        ).toBe(
          3
        );

        expect(
          result.summary.skippedDecisionPoints
        ).toBe(
          0
        );

        expect(
          result.summary.callDecisions
        ).toBe(
          1
        );

        expect(
          result.decisions.every(
            (decision) =>
              decision.status ===
              "analyzed"
          )
        ).toBe(
          true
        );

        expect(
          result.decisions.map(
            (decision) =>
              decision.action.type
          )
        ).toEqual([
          "call",
          "bet",
          "raise"
        ]);

        expect(
          result.decisions.every(
            (decision) =>
              decision.analysis !==
              undefined
          )
        ).toBe(
          true
        );

        expect(
          result.decisions.every(
            (decision) =>
              decision.analysis?.equity !==
              undefined
          )
        ).toBe(
          true
        );

        expect(
          result.decisions.every(
            (decision) =>
              decision.analysis?.validVillainCombos !==
              undefined
          )
        ).toBe(
          true
        );
      }
    );

    it(
      "analyzes an all-in decision",
      () => {
        const hand: HandHistory = {
          id: "all-in-hand",
          gameFormat: "cash",
          smallBlind: 1,
          bigBlind: 2,
          ante: 0,

          players: [
            {
              id: "hero",
              name: "Hero",
              position: "BTN",
              startingStack: 200,
              holeCards: [
                {
                  rank: "A",
                  suit: "hearts"
                },
                {
                  rank: "K",
                  suit: "hearts"
                }
              ]
            },
            {
              id: "villain",
              name: "Villain",
              position: "BB",
              startingStack: 200
            }
          ],

          forcedBets: [
            {
              playerId: "hero",
              type: "small_blind",
              amount: 1
            },
            {
              playerId: "villain",
              type: "big_blind",
              amount: 2
            }
          ],

          streets: [
            {
              street: "preflop",
              board: [],
              actions: [
                {
                  playerId: "villain",
                  type: "check",
                  amount: 0,
                  amountType: "contribution",
                  street: "preflop"
                },
                {
                  playerId: "hero",
                  type: "raise",
                  amount: 10,
                  amountType: "contribution",
                  street: "preflop"
                },
                {
                  playerId: "villain",
                  type: "call",
                  amount: 8,
                  amountType: "contribution",
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
                  rank: "Q",
                  suit: "spades"
                }
              ],
              actions: [
                {
                  playerId: "hero",
                  type: "all_in",
                  amount: 189,
                  amountType: "contribution",
                  street: "flop"
                }
              ]
            }
          ]
        };

        const villainRange =
          createRange([
            "QQ",
            "JJ",
            "TT",
            "AK"
          ]);

        const result =
          analyzeHandHistory(
            hand,
            {
              heroPlayerId: "hero",
              villainRange
            }
          );

        expect(
          result.summary.totalDecisionPoints
        ).toBe(
          2
        );

        expect(
          result.summary.analyzedDecisionPoints
        ).toBe(
          2
        );

        expect(
          result.summary.skippedDecisionPoints
        ).toBe(
          0
        );

        expect(
          result.decisions.map(
            (decision) =>
              decision.action.type
          )
        ).toEqual([
          "raise",
          "all_in"
        ]);

        const allInDecision =
          result.decisions.find(
            (decision) =>
              decision.action.type ===
              "all_in"
          );

        expect(
          allInDecision
        ).toBeDefined();

        expect(
          allInDecision?.status
        ).toBe(
          "analyzed"
        );

        expect(
          allInDecision?.context.opponentCallAmount
        ).toBeGreaterThan(
          0
        );

        expect(
          allInDecision?.analysis
        ).toBeDefined();

        expect(
          allInDecision?.analysis?.action
        ).toBe(
          "all_in"
        );

        expect(
          allInDecision?.analysis?.equity
        ).toBeGreaterThanOrEqual(
          0
        );

        expect(
          allInDecision?.analysis?.equity
        ).toBeLessThanOrEqual(
          1
        );

        expect(
          allInDecision?.analysis?.expectedValue
        ).toBeDefined();
      }
    );
  }
);