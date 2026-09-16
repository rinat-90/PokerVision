import {
  describe,
  expect,
  it
} from "vitest";

import type {
  HandHistoryPlayer
} from "@poker-vision/hand-history";

import {
  parsePokerStarsForcedBetActions
} from "./parse-forced-bet-actions.js";

const players: HandHistoryPlayer[] = [
  {
    id: "seat-1",
    name: "Hero",
    position: "BTN",
    startingStack: 200
  },
  {
    id: "seat-2",
    name: "Villain",
    position: "BB",
    startingStack: 200
  }
];

describe(
  "parsePokerStarsForcedBetActions",
  () => {
    it(
      "parses small and big blind actions",
      () => {
        const input = `
Hero: posts small blind 1
Villain: posts big blind 2
`;

        expect(
          parsePokerStarsForcedBetActions(
            input,
            players
          )
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
          }
        ]);
      }
    );

    it(
      "parses multiple antes",
      () => {
        const input = `
Hero: posts small blind 1
Villain: posts big blind 2
Hero: posts the ante 0.5
Villain: posts the ante 0.5
`;

        expect(
          parsePokerStarsForcedBetActions(
            input,
            players
          )
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
          }
        ]);
      }
    );

    it(
      "supports decimal blind amounts",
      () => {
        const input = `
Hero: posts small blind 0.50
Villain: posts big blind 1
`;

        expect(
          parsePokerStarsForcedBetActions(
            input,
            players
          )
        ).toEqual([
          {
            playerId: "seat-1",
            type: "small_blind",
            amount: 0.5
          },
          {
            playerId: "seat-2",
            type: "big_blind",
            amount: 1
          }
        ]);
      }
    );

    it(
      "throws for an unknown player",
      () => {
        const input = `
Unknown: posts small blind 1
`;

        expect(() =>
          parsePokerStarsForcedBetActions(
            input,
            players
          )
        ).toThrow(
          "Unable to find player for forced bet: Unknown"
        );
      }
    );

    it(
      "ignores unrelated lines",
      () => {
        const input = `
PokerStars Hand #123
Hero: folds
Villain: checks
`;

        expect(
          parsePokerStarsForcedBetActions(
            input,
            players
          )
        ).toEqual([]);
      }
    );
  }
);