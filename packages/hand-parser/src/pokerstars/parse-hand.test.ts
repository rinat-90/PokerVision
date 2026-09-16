import {
  describe,
  expect,
  it
} from "vitest";

import {
  parsePokerStarsHand
} from "./parse-hand.js";

describe(
  "parsePokerStarsHand",
  () => {
    it(
      "parses a complete PokerStars hand",
      () => {
        const input = `
PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD)
Table 'Test' 6-max Seat #1 is the button
Seat 1: Hero (200 in chips)
Seat 2: Villain (200 in chips)

*** HOLE CARDS ***
Hero: posts small blind 1
Villain: posts big blind 2
Dealt to Hero [Ah Kd]
Hero: raises 6 to 6
Villain: calls 4

*** FLOP *** [2c 7d Ks]
Hero: bets 10
Villain: calls 10

*** TURN *** [2c 7d Ks] [Ah]
Hero: checks
Villain: bets 20
Hero: calls 20

*** RIVER *** [2c 7d Ks Ah] [3s]
Hero: checks
Villain: checks

*** SHOW DOWN ***
Hero: shows [Ah Kd]
Villain: shows [Qc Qs]
`;

        const hand =
          parsePokerStarsHand(
            input
          );

        expect(hand).toEqual({
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
        });
      }
    );

    it(
      "resets street contributions before parsing a raise on the next street",
      () => {
        const input = `
PokerStars Hand #123456790: Hold'em No Limit ($1/$2 USD)
Table 'Test' 6-max Seat #1 is the button
Seat 1: Hero (200 in chips)
Seat 2: Villain (200 in chips)

*** HOLE CARDS ***
Hero: posts small blind 1
Villain: posts big blind 2
Dealt to Hero [Ah Kd]
Hero: raises 6 to 6
Villain: calls 4

*** FLOP *** [2c 7d Ks]
Hero: bets 10
Villain: raises 10 to 30
Hero: calls 20
`;

        const hand =
          parsePokerStarsHand(
            input
          );

        const flop =
          hand.streets.find(
            (street) =>
              street.street ===
              "flop"
          );

        expect(
          flop?.actions
        ).toEqual([
          {
            playerId: "seat-1",
            type: "bet",
            amount: 10,
            amountType: "contribution",
            street: "flop"
          },
          {
            playerId: "seat-2",
            type: "raise",
            amount: 30,
            amountType: "contribution",
            street: "flop"
          },
          {
            playerId: "seat-1",
            type: "call",
            amount: 20,
            amountType: "contribution",
            street: "flop"
          }
        ]);
      }
    );

    it(
      "assigns positions relative to the actual button seat",
      () => {
        const input = `
PokerStars Hand #123456791: Hold'em No Limit ($1/$2 USD)
Table 'Test' 6-max Seat #4 is the button
Seat 1: Player1 (200 in chips)
Seat 2: Player2 (200 in chips)
Seat 3: Player3 (200 in chips)
Seat 4: Player4 (200 in chips)
Seat 5: Player5 (200 in chips)
Seat 6: Player6 (200 in chips)

*** HOLE CARDS ***
Player5: posts small blind 1
Player6: posts big blind 2
`;

        const hand =
          parsePokerStarsHand(
            input
          );

        expect(
          hand.players
        ).toEqual([
          {
            id: "seat-4",
            name: "Player4",
            position: "BTN",
            startingStack: 200
          },
          {
            id: "seat-5",
            name: "Player5",
            position: "SB",
            startingStack: 200
          },
          {
            id: "seat-6",
            name: "Player6",
            position: "BB",
            startingStack: 200
          },
          {
            id: "seat-1",
            name: "Player1",
            position: "UTG",
            startingStack: 200
          },
          {
            id: "seat-2",
            name: "Player2",
            position: "HJ",
            startingStack: 200
          },
          {
            id: "seat-3",
            name: "Player3",
            position: "CO",
            startingStack: 200
          }
        ]);
      }
    );

    it(
      "parses antes for multiple players",
      () => {
        const input = `
PokerStars Hand #123456792: Hold'em No Limit ($1/$2 USD)
Table 'Test' 6-max Seat #1 is the button
Seat 1: Player1 (200 in chips)
Seat 2: Player2 (200 in chips)
Seat 3: Player3 (200 in chips)
Seat 4: Player4 (200 in chips)
Seat 5: Player5 (200 in chips)
Seat 6: Player6 (200 in chips)

*** HOLE CARDS ***
Player1: posts small blind 1
Player2: posts big blind 2
Player1: posts ante 0.5
Player2: posts ante 0.5
Player3: posts ante 0.5
Player4: posts ante 0.5
Player5: posts ante 0.5
Player6: posts ante 0.5
`;

        const hand =
          parsePokerStarsHand(
            input
          );

        expect(
          hand.ante
        ).toBe(0.5);

        expect(
          hand.forcedBets
        ).toEqual([
          {
            playerId: "seat-1",
            type: "small_blind",
            amount: 1
          },
          {
            playerId: "seat-2",
            type: "big_blind",
            amount: 2
          },
          {
            playerId: "seat-1",
            type: "ante",
            amount: 0.5
          },
          {
            playerId: "seat-2",
            type: "ante",
            amount: 0.5
          },
          {
            playerId: "seat-3",
            type: "ante",
            amount: 0.5
          },
          {
            playerId: "seat-4",
            type: "ante",
            amount: 0.5
          },
          {
            playerId: "seat-5",
            type: "ante",
            amount: 0.5
          },
          {
            playerId: "seat-6",
            type: "ante",
            amount: 0.5
          }
        ]);
      }
    );

    it(
      "parses raise-to as incremental contribution",
      () => {
        const input = `
PokerStars Hand #123456793: Hold'em No Limit ($1/$2 USD)
Table 'Test' 6-max Seat #1 is the button
Seat 1: Hero (200 in chips)
Seat 2: Villain (200 in chips)

*** HOLE CARDS ***
Hero: posts small blind 1
Villain: posts big blind 2
Dealt to Hero [Ah Kd]
Hero: raises 6 to 6
Villain: calls 4
`;

        const hand =
          parsePokerStarsHand(
            input
          );

        const preflop =
          hand.streets.find(
            (street) =>
              street.street ===
              "preflop"
          );

        expect(
          preflop?.actions
        ).toEqual([
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
        ]);
      }
    );
  }
);