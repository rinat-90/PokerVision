import {
  describe,
  expect,
  it
} from "vitest";

import {
  HandHistoryParserError
} from "../parser-error.js";

import {
  parsePokerStarsBoard
} from "./parse-board.js";

describe(
  "parsePokerStarsBoard",
  () => {
    it(
      "parses flop",
      () => {
        const input =
          "*** FLOP *** [Ah Kd 7c]";

        expect(
          parsePokerStarsBoard(
            input
          )
        ).toEqual([
          {
            street: "flop",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
              }
            ]
          }
        ]);
      }
    );

    it(
      "parses turn",
      () => {
        const input =
          "*** TURN *** [Ah Kd 7c] [2s]";

        expect(
          parsePokerStarsBoard(
            input
          )
        ).toEqual([
          {
            street: "turn",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
              },
              {
                rank: "2",
                suit: "spades"
              }
            ]
          }
        ]);
      }
    );

    it(
      "parses river",
      () => {
        const input =
          "*** RIVER *** [Ah Kd 7c 2s] [Jh]";

        expect(
          parsePokerStarsBoard(
            input
          )
        ).toEqual([
          {
            street: "river",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
              },
              {
                rank: "2",
                suit: "spades"
              },
              {
                rank: "J",
                suit: "hearts"
              }
            ]
          }
        ]);
      }
    );

    it(
      "parses a complete board",
      () => {
        const input = `
      *** FLOP *** [Ah Kd 7c]
      Hero: bets 5
      *** TURN *** [Ah Kd 7c] [2s]
      Hero: checks
      *** RIVER *** [Ah Kd 7c 2s] [Jh]
    `;

        expect(
          parsePokerStarsBoard(
            input
          )
        ).toEqual([
          {
            street: "flop",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
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
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
              },
              {
                rank: "2",
                suit: "spades"
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
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
              },
              {
                rank: "2",
                suit: "spades"
              },
              {
                rank: "J",
                suit: "hearts"
              }
            ]
          }
        ]);
      }
    );

    it(
      "supports lowercase cards",
      () => {
        const input =
          "*** FLOP *** [ah kd 7c]";

        expect(
          parsePokerStarsBoard(
            input
          )
        ).toEqual([
          {
            street: "flop",
            board: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "diamonds"
              },
              {
                rank: "7",
                suit: "clubs"
              }
            ]
          }
        ]);
      }
    );

    it(
      "throws for invalid card",
      () => {
        expect(() =>
          parsePokerStarsBoard(
            "*** FLOP *** [Ah Kd 1c]"
          )
        ).toThrow(
          HandHistoryParserError
        );
      }
    );

    it(
      "throws for invalid card suit",
      () => {
        expect(() =>
          parsePokerStarsBoard(
            "*** FLOP *** [Ah Kd 7x]"
          )
        ).toThrow(
          HandHistoryParserError
        );
      }
    );
  }
);