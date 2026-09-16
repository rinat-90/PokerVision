import {
  describe,
  expect,
  it
} from "vitest";

import {
  HandHistoryParserError
} from "../parser-error.js";

import {
  parsePokerStarsPlayers
} from "./parse-players.js";

describe(
  "parsePokerStarsPlayers",
  () => {
    it(
      "parses multiple players",
      () => {
        const input = `
          PokerStars Hand #123456789
          Seat 1: Hero (100 in chips)
          Seat 2: Villain (95 in chips)
          Seat 3: Player3 (120 in chips)
        `;

        expect(
          parsePokerStarsPlayers(
            input
          )
        ).toEqual([
          {
            id: "seat-1",
            name: "Hero",
            seat: 1,
            startingStack: 100
          },
          {
            id: "seat-2",
            name: "Villain",
            seat: 2,
            startingStack: 95
          },
          {
            id: "seat-3",
            name: "Player3",
            seat: 3,
            startingStack: 120
          }
        ]);
      }
    );

    it(
      "parses decimal stacks",
      () => {
        const input =
          "Seat 1: Hero (99.50 in chips)";

        expect(
          parsePokerStarsPlayers(
            input
          )
        ).toEqual([
          {
            id: "seat-1",
            name: "Hero",
            seat: 1,
            startingStack: 99.5
          }
        ]);
      }
    );

    it(
      "parses stacks with commas",
      () => {
        const input =
          "Seat 1: Hero (1,500 in chips)";

        expect(
          parsePokerStarsPlayers(
            input
          )
        ).toEqual([
          {
            id: "seat-1",
            name: "Hero",
            seat: 1,
            startingStack: 1500
          }
        ]);
      }
    );

    it(
      "ignores non-player lines",
      () => {
        const input = `
          PokerStars Hand #123456789
          Dealt to Hero [As Kh]
          Seat 1: Hero (100 in chips)
          *** HOLE CARDS ***
          Hero: raises 2 to 3
        `;

        expect(
          parsePokerStarsPlayers(
            input
          )
        ).toHaveLength(1);
      }
    );

    it(
      "throws when no players are found",
      () => {
        expect(() =>
          parsePokerStarsPlayers(
            "PokerStars Hand #123456789"
          )
        ).toThrow(
          HandHistoryParserError
        );
      }
    );
  }
);