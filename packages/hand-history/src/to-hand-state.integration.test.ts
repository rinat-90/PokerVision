import { describe, expect, it } from "vitest";

import type {
  HandHistory
} from "./types.js";

import {
  handHistoryToState
} from "./to-hand-state.js";

describe("handHistoryToState integration", () => {
  it(
    "reconstructs a complete preflop-to-river hand",
    () => {
      const hand: HandHistory = {
        id: "hand-1",
        gameFormat: "cash",
        smallBlind: 1,
        bigBlind: 2,
        ante: 0,

        players: [
          {
            id: "hero",
            name: "Hero",
            position: "BTN",
            startingStack: 100,
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
            startingStack: 100,
            holeCards: [
              {
                rank: "Q",
                suit: "hearts"
              },
              {
                rank: "Q",
                suit: "clubs"
              }
            ]
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
                amountType: "total",
                street: "preflop"
              },
              {
                playerId: "hero",
                type: "raise",
                amount: 6,
                amountType: "total",
                street: "preflop"
              },
              {
                playerId: "villain",
                type: "call",
                amount: 6,
                amountType: "total",
                street: "preflop"
              }
            ]
          },
          {
            street: "flop",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "7",
                suit: "clubs"
              },
              {
                rank: "2",
                suit: "diamonds"
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
                amount: 5,
                amountType: "contribution",
                street: "flop"
              },
              {
                playerId: "villain",
                type: "call",
                amount: 5,
                amountType: "contribution",
                street: "flop"
              }
            ]
          },
          {
            street: "turn",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "7",
                suit: "clubs"
              },
              {
                rank: "2",
                suit: "diamonds"
              },
              {
                rank: "K",
                suit: "diamonds"
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
                type: "bet",
                amount: 10,
                amountType: "contribution",
                street: "turn"
              },
              {
                playerId: "villain",
                type: "call",
                amount: 10,
                amountType: "contribution",
                street: "turn"
              }
            ]
          },
          {
            street: "river",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "7",
                suit: "clubs"
              },
              {
                rank: "2",
                suit: "diamonds"
              },
              {
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "3",
                suit: "spades"
              }
            ],
            actions: [
              {
                playerId: "villain",
                type: "check",
                amount: 0,
                amountType: "contribution",
                street: "river"
              },
              {
                playerId: "hero",
                type: "check",
                amount: 0,
                amountType: "contribution",
                street: "river"
              }
            ]
          }
        ]
      };

      const state =
        handHistoryToState(hand);

      expect(state.street)
        .toBe("river");

      expect(state.board)
        .toHaveLength(5);

      expect(state.pot)
        .toBe(42);

      expect(
        state.totalContributions.hero
      ).toBe(21);

      expect(
        state.totalContributions.villain
      ).toBe(21);

      expect(
        state.playerContributions.hero
      ).toBeUndefined();

      expect(
        state.playerContributions.villain
      ).toBeUndefined();

      expect(
        state.currentBet
      ).toBe(0);

      expect(
        state.bettingRoundComplete
      ).toBe(true);

      expect(
        state.currentPlayerId
      ).toBe(null);

      expect(
        state.playersToAct
      ).toEqual([]);

      expect(
        state.lastAggressorId
      ).toBe("hero");
    }
  );

  it(
    "reconstructs the correct player to act after a flop bet",
    () => {
      const hand: HandHistory = {
        id: "hand-2",
        gameFormat: "cash",
        smallBlind: 1,
        bigBlind: 2,
        ante: 0,

        players: [
          {
            id: "hero",
            name: "Hero",
            position: "BTN",
            startingStack: 100
          },
          {
            id: "villain",
            name: "Villain",
            position: "BB",
            startingStack: 100
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
                amount: 4,
                amountType: "contribution",
                street: "preflop"
              },
              {
                playerId: "villain",
                type: "call",
                amount: 2,
                amountType: "contribution",
                street: "preflop"
              }
            ]
          },
          {
            street: "flop",
            board: [
              {
                rank: "A",
                suit: "spades"
              },
              {
                rank: "8",
                suit: "hearts"
              },
              {
                rank: "4",
                suit: "clubs"
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
                amount: 5,
                amountType: "contribution",
                street: "flop"
              }
            ]
          }
        ]
      };

      const state =
        handHistoryToState(hand);

      expect(
        state.currentPlayerId
      ).toBe("villain");

      expect(
        state.playersToAct
      ).toEqual([
        "villain"
      ]);

      expect(
        state.currentBet
      ).toBe(5);

      expect(
        state.bettingRoundComplete
      ).toBe(false);
    }
  );

  it(
    "reconstructs the correct player after a turn re-raise",
    () => {
      const hand: HandHistory = {
        id: "hand-3",
        gameFormat: "cash",
        smallBlind: 1,
        bigBlind: 2,
        ante: 0,

        players: [
          {
            id: "utg",
            name: "UTG",
            position: "UTG",
            startingStack: 100
          },
          {
            id: "hj",
            name: "HJ",
            position: "HJ",
            startingStack: 100
          },
          {
            id: "co",
            name: "CO",
            position: "CO",
            startingStack: 100
          },
          {
            id: "btn",
            name: "BTN",
            position: "BTN",
            startingStack: 100
          },
          {
            id: "sb",
            name: "SB",
            position: "SB",
            startingStack: 100
          },
          {
            id: "bb",
            name: "BB",
            position: "BB",
            startingStack: 100
          }
        ],

        streets: [
          {
            street: "preflop",
            board: [],
            actions: []
          },
          {
            street: "flop",
            board: [
              {
                rank: "A",
                suit: "spades"
              },
              {
                rank: "K",
                suit: "hearts"
              },
              {
                rank: "7",
                suit: "clubs"
              }
            ],
            actions: [
              {
                playerId: "utg",
                type: "check",
                amount: 0,
                amountType: "contribution",
                street: "flop"
              },
              {
                playerId: "hj",
                type: "bet",
                amount: 5,
                amountType: "contribution",
                street: "flop"
              },
              {
                playerId: "co",
                type: "raise",
                amount: 15,
                amountType: "contribution",
                street: "flop"
              }
            ]
          }
        ]
      };

      const state =
        handHistoryToState(hand);

      expect(
        state.currentPlayerId
      ).toBe("btn");

      expect(
        state.playersToAct
      ).toEqual([
        "btn",
        "sb",
        "bb",
        "utg",
        "hj"
      ]);

      expect(
        state.currentBet
      ).toBe(15);

      expect(
        state.bettingRoundComplete
      ).toBe(false);

      expect(
        state.lastAggressorId
      ).toBe("co");
    }
  );
  it(
    "reconstructs an all-in hand with different player stacks",
    () => {
      const hand: HandHistory = {
        id: "hand-4",
        gameFormat: "cash",
        smallBlind: 1,
        bigBlind: 2,
        ante: 0,

        players: [
          {
            id: "short",
            name: "Short Stack",
            position: "BTN",
            startingStack: 20,
            holeCards: [
              {
                rank: "A",
                suit: "spades"
              },
              {
                rank: "A",
                suit: "hearts"
              }
            ]
          },
          {
            id: "medium",
            name: "Medium Stack",
            position: "SB",
            startingStack: 50,
            holeCards: [
              {
                rank: "K",
                suit: "spades"
              },
              {
                rank: "K",
                suit: "hearts"
              }
            ]
          },
          {
            id: "deep",
            name: "Deep Stack",
            position: "BB",
            startingStack: 100,
            holeCards: [
              {
                rank: "Q",
                suit: "spades"
              },
              {
                rank: "Q",
                suit: "hearts"
              }
            ]
          }
        ],

        streets: [
          {
            street: "preflop",
            board: [],
            actions: [
              {
                playerId: "deep",
                type: "raise",
                amount: 20,
                amountType: "total",
                street: "preflop"
              },
              {
                playerId: "short",
                type: "all_in",
                amount: 20,
                amountType: "total",
                street: "preflop"
              },
              {
                playerId: "medium",
                type: "all_in",
                amount: 50,
                amountType: "total",
                street: "preflop"
              },
              {
                playerId: "deep",
                type: "call",
                amount: 50,
                amountType: "total",
                street: "preflop"
              }
            ]
          }
        ]
      };

      const state =
        handHistoryToState(hand);

      expect(
        state.totalContributions.short
      ).toBe(20);

      expect(
        state.totalContributions.medium
      ).toBe(50);

      expect(
        state.totalContributions.deep
      ).toBe(50);

      expect(
        state.players.find(
          (player) =>
            player.id === "short"
        )?.status
      ).toBe("all_in");

      expect(
        state.players.find(
          (player) =>
            player.id === "medium"
        )?.status
      ).toBe("all_in");

      expect(
        state.players.find(
          (player) =>
            player.id === "deep"
        )?.status
      ).toBe("active");

      expect(state.pot)
        .toBe(120);
    }
  );
});