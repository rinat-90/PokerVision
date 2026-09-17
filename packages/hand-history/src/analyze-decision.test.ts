import {
  describe,
  expect,
  it
} from "vitest";

import type {
  Card,
  PlayerAction
} from "@poker-vision/poker-engine";

import {
  createRange
} from "@poker-vision/poker-engine";

import {
  analyzeDecision
} from "./analyze-decision.js";

import {
  createDecisionContext
} from "./decision-context.js";

import type {
  HandStateSnapshot
} from "./replay-hand.js";

describe(
  "analyzeDecision",
  () => {
    it(
      "uses the computed opponent range from the decision context",
      () => {
        const heroCards: Card[] = [
          {
            rank: "A",
            suit: "hearts"
          },
          {
            rank: "A",
            suit: "diamonds"
          }
        ];

        const board: Card[] = [
          {
            rank: "K",
            suit: "spades"
          },
          {
            rank: "7",
            suit: "clubs"
          },
          {
            rank: "2",
            suit: "hearts"
          }
        ];

        const targetAction: PlayerAction = {
          playerId: "hero",
          type: "call",
          amount: 20,
          street: "flop"
        };

        const snapshot: HandStateSnapshot = {
          actionIndex: 1,
          targetAction,
          street: "flop",
          board,
          players: [
            {
              id: "hero",
              name: "Hero",
              position: "BTN",
              stack: 180,
              status: "active",
              holeCards: [
                heroCards[0]!,
                heroCards[1]!
              ]
            },
            {
              id: "villain",
              name: "Villain",
              position: "BB",
              stack: 180,
              status: "active"
            }
          ],
          playersToAct: ["hero"],
          currentPlayerId: "hero",
          bettingRoundComplete: false,
          pot: 60,
          currentBet: 20,
          minimumRaise: 20,
          playerContributions: {
            hero: 0,
            villain: 20
          },
          totalContributions: {
            hero: 0,
            villain: 20
          },
          actions: []
        };

        const villainRange =
          createRange([
            "AA",
            "KK",
            "AK"
          ]);

        const context =
          createDecisionContext(
            snapshot,
            {
              villainRange
            }
          );

        const opponent =
          context.opponentContext.opponents[0];

        expect(
          opponent
        ).toBeDefined();

        expect(
          opponent?.opponent.range.combos.length
        ).toBeLessThan(
          villainRange.combos.length
        );

        const result =
          analyzeDecision(
            context,
            {
              villainRange
            }
          );

        expect(
          result.action
        ).toBe("call");

        expect(
          result.validVillainCombos
        ).toBe(
          opponent?.opponent.range.combos.length
        );

        expect(
          result.validVillainCombos
        ).toBeLessThan(
          villainRange.combos.length
        );
      }
    );

    it(
      "uses the opponent response fold probability for a bet",
      () => {
        const heroCards: Card[] = [
          {
            rank: "A",
            suit: "hearts"
          },
          {
            rank: "K",
            suit: "hearts"
          }
        ];

        const board: Card[] = [
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
        ];

        const targetAction: PlayerAction = {
          playerId: "hero",
          type: "bet",
          amount: 30,
          street: "flop"
        };

        const snapshot: HandStateSnapshot = {
          actionIndex: 1,
          targetAction,
          street: "flop",
          board,
          players: [
            {
              id: "hero",
              name: "Hero",
              position: "BTN",
              stack: 170,
              status: "active",
              holeCards: [
                heroCards[0]!,
                heroCards[1]!
              ]
            },
            {
              id: "villain",
              name: "Villain",
              position: "BB",
              stack: 170,
              status: "active"
            }
          ],
          playersToAct: ["hero"],
          currentPlayerId: "hero",
          bettingRoundComplete: false,
          pot: 60,
          currentBet: 0,
          minimumRaise: 20,
          playerContributions: {
            hero: 0,
            villain: 0
          },
          totalContributions: {
            hero: 0,
            villain: 0
          },
          actions: []
        };

        const villainRange =
          createRange([
            "QQ",
            "JJ",
            "AK"
          ]);

        const context =
          createDecisionContext(
            snapshot,
            {
              villainRange
            }
          );

        const opponent =
          context.opponentContext.opponents[0];

        expect(
          opponent
        ).toBeDefined();

        expect(
          opponent?.response.foldProbability
        ).toBe(0.33);

        const result =
          analyzeDecision(
            context,
            {
              villainRange
            }
          );

        expect(
          result.action
        ).toBe("bet");

        expect(
          result.validVillainCombos
        ).toBe(
          opponent?.opponent.range.combos.length
        );
      }
    );
  }
);