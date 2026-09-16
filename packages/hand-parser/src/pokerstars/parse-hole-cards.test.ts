import {
  describe,
  expect,
  it
} from "vitest";

import {
  parsePokerStarsHoleCards
} from "./parse-hole-cards.js";

describe(
  "parsePokerStarsHoleCards",
  () => {
    it(
      "parses hero hole cards",
      () => {
        const input =
          "Dealt to Hero [As Kh]";

        expect(
          parsePokerStarsHoleCards(
            input
          )
        ).toEqual([
          {
            playerName: "Hero",
            holeCards: [
              {
                rank: "A",
                suit: "spades"
              },
              {
                rank: "K",
                suit: "hearts"
              }
            ]
          }
        ]);
      }
    );

    it(
      "parses numeric cards",
      () => {
        const input =
          "Dealt to Villain [2c 7d]";

        expect(
          parsePokerStarsHoleCards(
            input
          )
        ).toEqual([
          {
            playerName: "Villain",
            holeCards: [
              {
                rank: "2",
                suit: "clubs"
              },
              {
                rank: "7",
                suit: "diamonds"
              }
            ]
          }
        ]);
      }
    );

    it(
      "handles lowercase card notation",
      () => {
        const input =
          "Dealt to Hero [as kh]";

        expect(
          parsePokerStarsHoleCards(
            input
          )
        ).toEqual([
          {
            playerName: "Hero",
            holeCards: [
              {
                rank: "A",
                suit: "spades"
              },
              {
                rank: "K",
                suit: "hearts"
              }
            ]
          }
        ]);
      }
    );

    it(
      "finds dealt line inside a hand history",
      () => {
        const input = `
          PokerStars Hand #123456789
          Seat 1: Hero (100 in chips)
          *** HOLE CARDS ***
          Dealt to Hero [Qs Jd]
          Hero: raises 3 to 4
        `;

        expect(
          parsePokerStarsHoleCards(
            input
          )
        ).toEqual([
          {
            playerName: "Hero",
            holeCards: [
              {
                rank: "Q",
                suit: "spades"
              },
              {
                rank: "J",
                suit: "diamonds"
              }
            ]
          }
        ]);
      }
    );

    it(
      "parses hole cards for multiple players",
      () => {
        const input = `
          Dealt to MrPink [8d 8s]
          Dealt to MrBrown [2h Kc]
          Dealt to Pluribus [4s 9s]
          Dealt to MrBlue [Kh Qh]
          Dealt to MrBlonde [2s 7d]
          Dealt to MrWhite [7h Jh]
        `;

        expect(
          parsePokerStarsHoleCards(
            input
          )
        ).toEqual([
          {
            playerName: "MrPink",
            holeCards: [
              {
                rank: "8",
                suit: "diamonds"
              },
              {
                rank: "8",
                suit: "spades"
              }
            ]
          },
          {
            playerName: "MrBrown",
            holeCards: [
              {
                rank: "2",
                suit: "hearts"
              },
              {
                rank: "K",
                suit: "clubs"
              }
            ]
          },
          {
            playerName: "Pluribus",
            holeCards: [
              {
                rank: "4",
                suit: "spades"
              },
              {
                rank: "9",
                suit: "spades"
              }
            ]
          },
          {
            playerName: "MrBlue",
            holeCards: [
              {
                rank: "K",
                suit: "hearts"
              },
              {
                rank: "Q",
                suit: "hearts"
              }
            ]
          },
          {
            playerName: "MrBlonde",
            holeCards: [
              {
                rank: "2",
                suit: "spades"
              },
              {
                rank: "7",
                suit: "diamonds"
              }
            ]
          },
          {
            playerName: "MrWhite",
            holeCards: [
              {
                rank: "7",
                suit: "hearts"
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
      "returns an empty array when hole cards are absent",
      () => {
        expect(
          parsePokerStarsHoleCards(
            "PokerStars Hand #123456789"
          )
        ).toEqual([]);
      }
    );
  }
);