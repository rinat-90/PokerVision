import {
  describe,
  expect,
  it
} from "vitest";

import {
  handHistoryToState
} from "./to-hand-state.js";

import type {
  HandHistory
} from "./types.js";

describe(
  "PokerStars hand history pipeline",
  () => {
    it(
      "converts a parsed-style hand history into a correct HandState",
      () => {
        const hand: HandHistory = {
          id: "123456789",
          gameFormat: "cash",
          smallBlind: 1,
          bigBlind: 2,
          ante: 0,
          players: [
            {
              id: "seat-1",
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
                  suit: "diamonds"
                }
              ]
            },
            {
              id: "seat-2",
              name: "Villain",
              position: "BB",
              startingStack: 200,
              holeCards: [
                {
                  rank: "Q",
                  suit: "clubs"
                },
                {
                  rank: "Q",
                  suit: "spades"
                }
              ]
            }
          ],
          forcedBets: [
            {
              playerId: "seat-1",
              type: "small_blind",
              amount: 1
            },
            {
              playerId: "seat-2",
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
                  playerId: "seat-1",
                  type: "raise",
                  amount: 5,
                  amountType: "contribution",
                  street: "preflop"
                },
                {
                  playerId: "seat-2",
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
                  playerId: "seat-1",
                  type: "bet",
                  amount: 10,
                  amountType: "contribution",
                  street: "flop"
                },
                {
                  playerId: "seat-2",
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
                  rank: "A",
                  suit: "hearts"
                }
              ],
              actions: [
                {
                  playerId: "seat-1",
                  type: "check",
                  amount: 0,
                  amountType: "contribution",
                  street: "turn"
                },
                {
                  playerId: "seat-2",
                  type: "bet",
                  amount: 20,
                  amountType: "contribution",
                  street: "turn"
                },
                {
                  playerId: "seat-1",
                  type: "call",
                  amount: 20,
                  amountType: "contribution",
                  street: "turn"
                }
              ]
            },
            {
              street: "river",
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
                  rank: "A",
                  suit: "hearts"
                },
                {
                  rank: "3",
                  suit: "spades"
                }
              ],
              actions: [
                {
                  playerId: "seat-1",
                  type: "check",
                  amount: 0,
                  amountType: "contribution",
                  street: "river"
                },
                {
                  playerId: "seat-2",
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
          handHistoryToState(
            hand
          );

        expect(
          state.street
        ).toBe(
          "river"
        );

        expect(
          state.board
        ).toHaveLength(
          5
        );

        expect(
          state.pot
        ).toBe(
          72
        );

        expect(
          state.totalContributions
        ).toEqual({
          "seat-1": 36,
          "seat-2": 36
        });

        expect(
          state.playerContributions
        ).toEqual({});

        expect(
          state.players[0]?.stack
        ).toBe(
          164
        );

        expect(
          state.players[1]?.stack
        ).toBe(
          164
        );
      }
    );
  }
);