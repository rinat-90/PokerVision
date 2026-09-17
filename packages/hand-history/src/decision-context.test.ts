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
  createDecisionContext
} from "./decision-context.js";

import type {
  HandStateSnapshot
} from "./replay-hand.js";

describe(
  "createDecisionContext",
  () => {
    it(
      "creates a decision context from a replay snapshot",
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
        ];

        const targetAction: PlayerAction = {
          playerId: "seat-1",
          type: "call",
          amount: 20,
          street: "turn"
        };

        const snapshot: HandStateSnapshot = {
          actionIndex: 6,
          targetAction,
          street: "turn",
          board,
          players: [
            {
              id: "seat-1",
              name: "Hero",
              position: "SB",
              stack: 184,
              status: "active",
              holeCards: [
                heroCards[0]!,
                heroCards[1]!
              ]
            },
            {
              id: "seat-2",
              name: "Villain",
              position: "BB",
              stack: 164,
              status: "active"
            }
          ],
          playersToAct: ["seat-1"],
          currentPlayerId: "seat-1",
          bettingRoundComplete: false,
          pot: 52,
          currentBet: 20,
          minimumRaise: 2,
          playerContributions: {
            "seat-1": 0,
            "seat-2": 20
          },
          totalContributions: {
            "seat-1": 16,
            "seat-2": 36
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

        expect(
          context.actionIndex
        ).toBe(6);

        expect(
          context.playerId
        ).toBe("seat-1");

        expect(
          context.street
        ).toBe("turn");

        expect(
          context.heroCards
        ).toEqual(heroCards);

        expect(
          context.board
        ).toEqual(board);

        expect(
          context.pot
        ).toBe(52);

        expect(
          context.currentBet
        ).toBe(20);

        expect(
          context.playerContribution
        ).toBe(0);

        expect(
          context.callAmount
        ).toBe(20);

        expect(
          context.decisionOptions
        ).toEqual({
          canFold: true,
          canCheck: false,
          canCall: true,
          callAmount: 20,
          canBet: false,
          minimumBet: 0,
          canRaise: true,
          minimumRaise: 22
        });

        expect(
          context.opponentContext.heroPlayerId
        ).toBe("seat-1");

        expect(
          context.opponentContext.opponents
        ).toHaveLength(1);

        const opponent =
          context.opponentContext.opponents[0];

        expect(
          opponent
        ).toBeDefined();

        expect(
          opponent?.opponent.playerId
        ).toBe("seat-2");

        expect(
          opponent?.opponent.playerName
        ).toBe("Villain");

        expect(
          opponent?.opponent.position
        ).toBe("BB");

        expect(
          opponent?.opponent.stack
        ).toBe(164);

        expect(
          opponent?.opponent.status
        ).toBe("active");

        expect(
          opponent?.opponent.range.combos.length
        ).toBeLessThan(
          villainRange.combos.length
        );

        expect(
          opponent?.opponent.range.combos.length
        ).toBeGreaterThan(0);

        expect(
          opponent?.opponent.range.combos.every(
            (combo) =>
              !combo.cards.some(
                (card) =>
                  board.some(
                    (boardCard) =>
                      boardCard.rank === card.rank &&
                      boardCard.suit === card.suit
                  )
              )
          )
        ).toBe(true);

        expect(
          opponent?.opponent.range.combos.every(
            (combo) =>
              !combo.cards.some(
                (card) =>
                  heroCards.some(
                    (heroCard) =>
                      heroCard.rank === card.rank &&
                      heroCard.suit === card.suit
                  )
              )
          )
        ).toBe(true);

        expect(
          opponent?.response
        ).toEqual({
          foldProbability: 0.33,
          callProbability: 0.67,
          raiseProbability: 0
        });

        expect(
          context.targetAction
        ).toEqual(targetAction);
      }
    );

    it(
      "calculates call amount from current bet and contribution",
      () => {
        const snapshot: HandStateSnapshot = {
          actionIndex: 6,
          targetAction: {
            playerId: "seat-1",
            type: "call",
            amount: 15,
            street: "turn"
          },
          street: "turn",
          board: [],
          players: [
            {
              id: "seat-1",
              name: "Hero",
              position: "SB",
              stack: 100,
              status: "active",
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
            }
          ],
          playersToAct: ["seat-1"],
          currentPlayerId: "seat-1",
          bettingRoundComplete: false,
          pot: 100,
          currentBet: 25,
          minimumRaise: 2,
          playerContributions: {
            "seat-1": 10
          },
          totalContributions: {
            "seat-1": 10
          },
          actions: []
        };

        const context =
          createDecisionContext(
            snapshot
          );

        expect(
          context.callAmount
        ).toBe(15);

        expect(
          context.playerContribution
        ).toBe(10);

        expect(
          context.decisionOptions.callAmount
        ).toBe(15);

        expect(
          context.decisionOptions.canFold
        ).toBe(true);

        expect(
          context.decisionOptions.canCheck
        ).toBe(false);

        expect(
          context.decisionOptions.canCall
        ).toBe(true);

        expect(
          context.decisionOptions.canBet
        ).toBe(false);

        expect(
          context.decisionOptions.canRaise
        ).toBe(true);

        expect(
          context.decisionOptions.minimumRaise
        ).toBe(27);
      }
    );

    it(
      "throws when the decision player has no hole cards",
      () => {
        const snapshot: HandStateSnapshot = {
          actionIndex: 6,
          targetAction: {
            playerId: "seat-1",
            type: "call",
            amount: 20,
            street: "turn"
          },
          street: "turn",
          board: [],
          players: [
            {
              id: "seat-1",
              name: "Hero",
              position: "SB",
              stack: 100,
              status: "active"
            }
          ],
          playersToAct: ["seat-1"],
          currentPlayerId: "seat-1",
          bettingRoundComplete: false,
          pot: 100,
          currentBet: 20,
          minimumRaise: 2,
          playerContributions: {
            "seat-1": 0
          },
          totalContributions: {
            "seat-1": 0
          },
          actions: []
        };

        expect(
          () =>
            createDecisionContext(
              snapshot
            )
        ).toThrow(
          "Player has no hole cards: seat-1"
        );
      }
    );
  }
);