import {
  describe,
  expect,
  it
} from "vitest";

import {
  HandHistoryParserError
} from "../parser-error.js";

import {
  parsePokerStarsHeader
} from "./parse-header.js";

describe(
  "parsePokerStarsHeader",
  () => {
    it(
      "parses a cash game header",
      () => {
        const input =
          "PokerStars Hand #123456789: Hold'em No Limit ($0.50/$1.00 USD) - 2026/09/15 12:00:00 ET";

        expect(
          parsePokerStarsHeader(
            input
          )
        ).toEqual({
          id: "123456789",
          gameFormat: "cash",
          smallBlind: 0.5,
          bigBlind: 1
        });
      }
    );

    it(
      "parses a one dollar cash game",
      () => {
        const input =
          "PokerStars Hand #987654321: Hold'em No Limit ($1/$2 USD) - 2026/09/15 12:00:00 ET";

        expect(
          parsePokerStarsHeader(
            input
          )
        ).toEqual({
          id: "987654321",
          gameFormat: "cash",
          smallBlind: 1,
          bigBlind: 2
        });
      }
    );

    it(
      "parses a tournament header",
      () => {
        const input =
          "PokerStars Hand #555555555: Tournament #123456789, Freeroll Hold'em No Limit";

        expect(
          parsePokerStarsHeader(
            input
          )
        ).toEqual({
          id: "555555555",
          gameFormat: "tournament",
          smallBlind: 0,
          bigBlind: 0
        });
      }
    );

    it(
      "throws when the header is missing",
      () => {
        expect(() =>
          parsePokerStarsHeader(
            "BTN: Hero ($100)"
          )
        ).toThrow(
          HandHistoryParserError
        );
      }
    );

    it(
      "throws when blinds cannot be parsed",
      () => {
        const input =
          "PokerStars Hand #123456789: Hold'em No Limit";

        expect(() =>
          parsePokerStarsHeader(
            input
          )
        ).toThrow(
          HandHistoryParserError
        );
      }
    );
  }
);