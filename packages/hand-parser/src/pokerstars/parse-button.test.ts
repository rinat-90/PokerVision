import {
  describe,
  expect,
  it
} from "vitest";

import {
  parsePokerStarsButtonSeat
} from "./parse-button.js";

describe(
  "parsePokerStarsButtonSeat",
  () => {
    it(
      "parses the button seat",
      () => {
        const input = `
PokerStars Hand #123456789: Hold'em No Limit ($1/$2 USD)
Table 'Test' 6-max Seat #4 is the button
Seat 1: Player1 (200 in chips)
Seat 2: Player2 (200 in chips)
Seat 3: Player3 (200 in chips)
Seat 4: Player4 (200 in chips)
`;

        expect(
          parsePokerStarsButtonSeat(
            input
          )
        ).toBe(4);
      }
    );

    it(
      "works with different button seats",
      () => {
        const input = `
PokerStars Hand #123456790: Hold'em No Limit ($1/$2 USD)
Table 'Test' 6-max Seat #6 is the button
`;

        expect(
          parsePokerStarsButtonSeat(
            input
          )
        ).toBe(6);
      }
    );

    it(
      "throws when button information is missing",
      () => {
        const input = `
PokerStars Hand #123456791: Hold'em No Limit ($1/$2 USD)
Seat 1: Player1 (200 in chips)
Seat 2: Player2 (200 in chips)
`;

        expect(() =>
          parsePokerStarsButtonSeat(
            input
          )
        ).toThrow(
          "PokerStars button seat not found"
        );
      }
    );
  }
);