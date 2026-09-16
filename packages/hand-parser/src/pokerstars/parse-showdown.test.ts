import {
  describe,
  expect,
  it
} from "vitest";

import {
  parsePokerStarsShowdown
} from "./parse-showdown.js";

describe(
  "parsePokerStarsShowdown",
  () => {
    it(
      "parses visible showdown cards",
      () => {
        const input = `
*** SHOW DOWN ***
Hero: shows [Ah Ad]
Villain: shows [Qc Qs]
`;

        expect(
          parsePokerStarsShowdown(
            input
          )
        ).toEqual([
          {
            playerName: "Hero",
            holeCards: [
              {
                rank: "A",
                suit: "hearts"
              },
              {
                rank: "A",
                suit: "diamonds"
              }
            ]
          },
          {
            playerName: "Villain",
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
        ]);
      }
    );

    it(
      "returns an empty array when there are no showdown cards",
      () => {
        expect(
          parsePokerStarsShowdown(
            `
*** SHOW DOWN ***
`
          )
        ).toEqual([]);
      }
    );
  }
);