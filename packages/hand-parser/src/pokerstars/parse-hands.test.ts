import {
  describe,
  expect,
  it
} from "vitest";

import {
  parsePokerStarsHands
} from "./parse-hands.js";

const HAND_1 = `
PokerStars Hand #100000: Hold'em No Limit (50/100)
Table 'Test' 2-max Seat #2 is the button
Seat 1: Alice (10000 in chips)
Seat 2: Bob (10000 in chips)
Alice: posts small blind 50
Bob: posts big blind 100
*** HOLE CARDS ***
Dealt to Alice [Tc Qc]
Alice: folds
Bob collected 150 from pot
*** SUMMARY ***
Total pot 150 | Rake 0
`;

const HAND_2 = `
PokerStars Hand #100001: Hold'em No Limit (50/100)
Table 'Test' 2-max Seat #1 is the button
Seat 1: Alice (10000 in chips)
Seat 2: Bob (10000 in chips)
Alice: posts small blind 50
Bob: posts big blind 100
*** HOLE CARDS ***
Dealt to Alice [Ah Ad]
Alice: raises 150 to 250
Bob: folds
Uncalled bet (150) returned to Alice
Alice collected 150 from pot
*** SUMMARY ***
Total pot 150 | Rake 0
`;

describe(
  "parsePokerStarsHands",
  () => {
    it(
      "parses multiple PokerStars hands",
      () => {
        const input =
          `${HAND_1}\n\n${HAND_2}`;

        const hands =
          parsePokerStarsHands(
            input
          );

        expect(hands).toHaveLength(2);

        expect(hands[0]?.id)
          .toBe("100000");

        expect(hands[1]?.id)
          .toBe("100001");
      }
    );

    it(
      "throws when no hands are present",
      () => {
        expect(() =>
          parsePokerStarsHands(
            "not a PokerStars hand"
          )
        ).toThrow(
          "No PokerStars hands found"
        );
      }
    );
  }
);