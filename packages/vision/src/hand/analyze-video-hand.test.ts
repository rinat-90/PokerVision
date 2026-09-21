import {
  describe,
  expect,
  it
} from "vitest";

import {
  createRange
} from "@poker-vision/poker-engine";

import {
  analyzeVideoHand
} from "./analyze-video-hand.js";

import type {
  VideoHand
} from "./video-hand.js";

describe(
  "analyzeVideoHand",
  () => {
    it(
      "analyzes a reconstructed video hand end to end",
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

        const report =
          analyzeVideoHand(
            hand,
            {
              metadata: {
                handId:
                  "video-e2e-analysis",

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
              },

              analysis: {
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
            }
          );

        expect(
          report.handId
        ).toBe(
          "video-e2e-analysis"
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