import {
  describe,
  expect,
  it
} from "vitest";

import {
  analyzeHandHistory,
  createAnalysisReport
} from "@poker-vision/hand-history";

import {
  createRange
} from "@poker-vision/poker-engine";

import type {
  VideoHand
} from "./video-hand.js";

import {
  videoHandToHandHistory
} from "./video-hand-to-hand-history.js";

describe(
  "VideoHand decision analysis",
  () => {
    it(
      "analyzes a hero call reconstructed from video",
      () => {
        const hand: VideoHand = {
          startedAt: 10,
          completedAt: 20,

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

          streets: [],

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
            }
          ]
        };

        const history =
          videoHandToHandHistory(
            hand,
            {
              handId:
                "video-analysis-1",

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
                  seatIndex: 1,
                  playerId: "villain",
                  name: "Villain",
                  position: "BB",
                  startingStack: 5000
                }
              ]
            }
          );

        const analysis =
          analyzeHandHistory(
            history,
            {
              heroPlayerId:
                "hero",

              villainRange:
                createRange([
                  "QQ",
                  "JJ",
                  "TT",
                  "AQs",
                  "AQo"
                ]),

              iterationsPerCombo:
                100
            }
          );

        expect(
          analysis.handId
        ).toBe(
          "video-analysis-1"
        );

        expect(
          analysis.summary.totalDecisionPoints
        ).toBe(1);

        expect(
          analysis.summary.analyzedDecisionPoints
        ).toBe(1);

        expect(
          analysis.summary.skippedDecisionPoints
        ).toBe(0);

        expect(
          analysis.summary.callDecisions
        ).toBe(1);

        const decision =
          analysis.decisions[0];

        expect(
          decision
        ).toBeDefined();

        expect(
          decision?.actionIndex
        ).toBe(0);

        expect(
          decision?.action
        ).toEqual({
          playerId: "hero",
          type: "call",
          amount: 75,
          street: "preflop"
        });

        expect(
          decision?.context.playerId
        ).toBe("hero");

        expect(
          decision?.context.street
        ).toBe("preflop");

        expect(
          decision?.context.heroCards
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
          decision?.context.board
        ).toEqual([]);

        expect(
          decision?.context.pot
        ).toBe(75);

        expect(
          decision?.context.currentBet
        ).toBe(50);

        expect(
          decision?.context.playerContribution
        ).toBe(25);

        expect(
          decision?.context.callAmount
        ).toBe(25);

        expect(
          decision?.status
        ).toBe("analyzed");

        expect(
          decision?.analysis
        ).toBeDefined();

        expect(
          decision?.analysis?.action
        ).toBe("call");

        expect(
          decision?.analysis?.validVillainCombos
        ).toBeGreaterThan(0);

        expect(
          decision?.analysis?.equity
        ).toBeGreaterThanOrEqual(0);

        expect(
          decision?.analysis?.equity
        ).toBeLessThanOrEqual(1);
      }
    );

    it(
      "analyzes a hero bet reconstructed from video",
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
                  suit: "clubs",
                  rankConfidence: 1,
                  suitConfidence: 1,
                  confidence: 1
                },
                {
                  rank: "7",
                  suit: "diamonds",
                  rankConfidence: 1,
                  suitConfidence: 1,
                  confidence: 1
                },
                {
                  rank: "K",
                  suit: "spades",
                  rankConfidence: 1,
                  suitConfidence: 1,
                  confidence: 1
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
              amount: 50,
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
              amount: 100,
              timestampSeconds: 22
            }
          ]
        };

        const history =
          videoHandToHandHistory(
            hand,
            {
              handId:
                "video-bet-analysis",

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
                  startingStack: 5000,

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
                  seatIndex: 1,
                  playerId: "villain",
                  name: "Villain",
                  position: "BB",
                  startingStack: 5000
                }
              ]
            }
          );

        const analysis =
          analyzeHandHistory(
            history,
            {
              heroPlayerId:
                "hero",

              villainRange:
                createRange([
                  "QQ",
                  "JJ",
                  "TT",
                  "AK"
                ]),

              iterationsPerCombo:
                100,

              foldProbability:
                0.4
            }
          );

        expect(
          analysis.summary.totalDecisionPoints
        ).toBe(2);

        expect(
          analysis.summary.analyzedDecisionPoints
        ).toBe(2);

        expect(
          analysis.decisions.map(
            decision =>
              decision.action.type
          )
        ).toEqual([
          "call",
          "bet"
        ]);

        const betDecision =
          analysis.decisions[1];

        expect(
          betDecision?.context.street
        ).toBe("flop");

        expect(
          betDecision?.context.board
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
            suit: "spades"
          }
        ]);

        expect(
          betDecision?.action
        ).toEqual({
          playerId: "hero",
          type: "bet",
          amount: 100,
          street: "flop"
        });

        expect(
          betDecision?.status
        ).toBe("analyzed");

        expect(
          betDecision?.analysis
        ).toBeDefined();

        expect(
          betDecision?.analysis?.action
        ).toBe("bet");

        expect(
          betDecision?.analysis?.validVillainCombos
        ).toBeGreaterThan(0);
      }
    );

    it(
      "analyzes a hero raise reconstructed from video",
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

          streets: [],

          actions: [
            {
              seatIndex: 0,
              street: "preflop",
              type: "raise",
              amount: 150,
              timestampSeconds: 12
            }
          ]
        };

        const history =
          videoHandToHandHistory(
            hand,
            {
              handId:
                "video-raise-analysis",

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
                  seatIndex: 1,
                  playerId: "villain",
                  name: "Villain",
                  position: "BB",
                  startingStack: 5000
                }
              ]
            }
          );

        const analysis =
          analyzeHandHistory(
            history,
            {
              heroPlayerId:
                "hero",

              villainRange:
                createRange([
                  "QQ",
                  "JJ",
                  "TT",
                  "AQs",
                  "AQo"
                ]),

              iterationsPerCombo:
                100,

              foldProbability:
                0.4
            }
          );

        expect(
          analysis.summary.totalDecisionPoints
        ).toBe(1);

        const decision =
          analysis.decisions[0];

        expect(
          decision?.action
        ).toEqual({
          playerId: "hero",
          type: "raise",
          amount: 125,
          street: "preflop"
        });

        expect(
          decision?.context.raiseAmount
        ).toBe(125);

        expect(
          decision?.context.opponentCallAmount
        ).toBe(100);

        expect(
          decision?.context.pot
        ).toBe(75);

        expect(
          decision?.context.currentBet
        ).toBe(50);

        expect(
          decision?.context.playerContribution
        ).toBe(25);

        expect(
          decision?.context.callAmount
        ).toBe(25);

        expect(
          decision?.status
        ).toBe("analyzed");

        expect(
          decision?.analysis?.action
        ).toBe("raise");

        expect(
          decision?.analysis?.validVillainCombos
        ).toBeGreaterThan(0);
      }
    );
    it(
      "creates an analysis report from a reconstructed video hand",
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

          streets: [],

          actions: [
            {
              seatIndex: 0,
              street: "preflop",
              type: "raise",
              amount: 150,
              timestampSeconds: 12
            }
          ]
        };

        const history =
          videoHandToHandHistory(
            hand,
            {
              handId:
                "video-report-analysis",

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
                  seatIndex: 1,
                  playerId: "villain",
                  name: "Villain",
                  position: "BB",
                  startingStack: 5000
                }
              ]
            }
          );

        const analysis =
          analyzeHandHistory(
            history,
            {
              heroPlayerId:
                "hero",

              villainRange:
                createRange([
                  "QQ",
                  "JJ",
                  "TT",
                  "AQs",
                  "AQo"
                ]),

              iterationsPerCombo:
                100,

              foldProbability:
                0.4
            }
          );

        const report =
          createAnalysisReport(
            analysis
          );

        expect(
          report.handId
        ).toBe(
          "video-report-analysis"
        );

        expect(
          report.summary
        ).toEqual({
          totalDecisionPoints: 1,
          analyzedDecisionPoints: 1,
          skippedDecisionPoints: 0,
          callDecisions: 0
        });

        expect(
          report.decisions
        ).toHaveLength(1);

        const decision =
          report.decisions[0];

        expect(
          decision
        ).toBeDefined();

        expect(
          decision?.actionIndex
        ).toBe(0);

        expect(
          decision?.street
        ).toBe("preflop");

        expect(
          decision?.action
        ).toBe("raise");

        expect(
          decision?.amount
        ).toBe(125);

        expect(
          decision?.pot
        ).toBe(75);

        expect(
          decision?.callAmount
        ).toBe(25);

        expect(
          decision?.status
        ).toBe("analyzed");

        expect(
          decision?.equity
        ).toBeGreaterThanOrEqual(0);

        expect(
          decision?.equity
        ).toBeLessThanOrEqual(1);

        expect(
          decision?.decision
        ).toBeDefined();
      }
    );
  }
);