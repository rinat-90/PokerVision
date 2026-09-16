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
        ).toEqual({
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
        });
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
        ).toEqual({
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
        });
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
        ).toEqual({
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
        });
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
        ).toEqual({
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
        });
      }
    );

    it(
      "returns null when hole cards are absent",
      () => {
        expect(
          parsePokerStarsHoleCards(
            "PokerStars Hand #123456789"
          )
        ).toBeNull();
      }
    );
  }
);