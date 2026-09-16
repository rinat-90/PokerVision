import {
  describe,
  expect,
  it
} from "vitest";

import {
  parsePokerStarsForcedBets
} from "./parse-forced-bets.js";

describe(
  "parsePokerStarsForcedBets",
  () => {
    it(
      "parses small blind and big blind",
      () => {
        const input = `
Player1: posts small blind 1
Player2: posts big blind 2
`;

        expect(
          parsePokerStarsForcedBets(
            input
          )
        ).toEqual({
          smallBlind: 1,
          bigBlind: 2,
          ante: 0
        });
      }
    );

    it(
      "parses antes",
      () => {
        const input = `
Player1: posts small blind 1
Player2: posts big blind 2
Player1: posts the ante 0.5
Player2: posts the ante 0.5
`;

        expect(
          parsePokerStarsForcedBets(
            input
          )
        ).toEqual({
          smallBlind: 1,
          bigBlind: 2,
          ante: 0.5
        });
      }
    );

    it(
      "supports decimal amounts",
      () => {
        const input = `
Player1: posts small blind 0.50
Player2: posts big blind 1
Player1: posts ante 0.10
Player2: posts ante 0.10
`;

        expect(
          parsePokerStarsForcedBets(
            input
          )
        ).toEqual({
          smallBlind: 0.5,
          bigBlind: 1,
          ante: 0.1
        });
      }
    );

    it(
      "throws when blinds are missing",
      () => {
        const input = `
Player1: posts ante 0.5
`;

        expect(() =>
          parsePokerStarsForcedBets(
            input
          )
        ).toThrow(
          "PokerStars blinds not found"
        );
      }
    );
  }
);