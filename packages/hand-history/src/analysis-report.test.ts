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

import {
  createAnalysisReport
} from "./analysis-report.js";

import type {
  HandHistory
} from "./types.js";

describe("createAnalysisReport", () => {
  it("creates a clean report from hand analysis", () => {
    const hand: HandHistory = {
      id: "report-test-hand",
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
              rank: "A",
              suit: "diamonds"
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
              playerId: "hero",
              type: "raise",
              amount: 5,
              amountType: "contribution",
              street: "preflop"
            },
            {
              playerId: "villain",
              type: "call",
              amount: 4,
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
              playerId: "hero",
              type: "check",
              amount: 0,
              amountType: "contribution",
              street: "turn"
            },
            {
              playerId: "villain",
              type: "bet",
              amount: 20,
              amountType: "contribution",
              street: "turn"
            },
            {
              playerId: "hero",
              type: "call",
              amount: 20,
              amountType: "contribution",
              street: "turn"
            }
          ]
        }
      ]
    };

    const analysis =
      analyzeHandHistory(
        hand,
        {
          heroPlayerId: "hero",
          villainRange:
            createRange([
              "QQ",
              "JJ",
              "TT",
              "AK"
            ])
        }
      );

    const report =
      createAnalysisReport(
        analysis
      );

    expect(report.handId)
      .toBe("report-test-hand");

    expect(report.summary)
      .toEqual({
        totalDecisionPoints: 3,
        analyzedDecisionPoints: 1,
        callDecisions: 1
      });

    expect(report.decisions)
      .toHaveLength(1);

    expect(report.decisions[0])
      .toMatchObject({
        actionIndex: 6,
        street: "turn",
        action: "call",
        amount: 20,
        pot: 52,
        callAmount: 20
      });

    expect(
      report.decisions[0]?.equity
    ).toBeGreaterThan(0);
  });
});