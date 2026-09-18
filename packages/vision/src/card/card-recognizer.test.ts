import {
  describe,
  expect,
  it
} from "vitest";

import {
  CardRecognizer
} from "./card-recognizer.js";

import {
  RankRecognizer
} from "./rank-recognizer.js";

import {
  SuitRecognizer
} from "./suit-recognizer.js";

import type {
  SymbolMask
} from "./symbol-mask.js";

function createMask(
  values: number[]
): SymbolMask {
  return {
    width: 2,
    height: 2,
    data:
      Uint8Array.from(
        values
      )
  };
}

describe(
  "CardRecognizer",
  () => {
    it(
      "recognizes rank and suit as a card",
      () => {
        const rank5 =
          createMask([
            1, 1,
            0, 0
          ]);

        const clubs =
          createMask([
            0, 0,
            1, 1
          ]);

        const rankRecognizer =
          new RankRecognizer(
            [
              {
                rank: "5",
                mask: rank5
              }
            ]
          );

        const suitRecognizer =
          new SuitRecognizer(
            [
              {
                suit: "clubs",
                mask: clubs
              }
            ]
          );

        const recognizer =
          new CardRecognizer(
            rankRecognizer,
            suitRecognizer
          );

        expect(
          recognizer.recognize({
            rank: rank5,
            suit: clubs
          })
        ).toEqual({
          card: {
            rank: "5",
            suit: "clubs",
            rankConfidence: 1,
            suitConfidence: 1,
            confidence: 1
          },
          rankConfidence: 1,
          suitConfidence: 1
        });
      }
    );

    it(
      "uses the weaker symbol confidence as card confidence",
      () => {
        const rankTemplate =
          createMask([
            1, 1,
            0, 0
          ]);

        const suitTemplate =
          createMask([
            0, 0,
            1, 1
          ]);

        const rankRecognizer =
          new RankRecognizer(
            [
              {
                rank: "5",
                mask:
                rankTemplate
              }
            ],
            {
              minimumConfidence:
                0.7
            }
          );

        const suitRecognizer =
          new SuitRecognizer(
            [
              {
                suit: "clubs",
                mask:
                suitTemplate
              }
            ]
          );

        const recognizer =
          new CardRecognizer(
            rankRecognizer,
            suitRecognizer
          );

        const recognition =
          recognizer.recognize({
            rank:
              createMask([
                1, 1,
                0, 1
              ]),
            suit:
            suitTemplate
          });

        expect(
          recognition.card
        ).toEqual({
          rank: "5",
          suit: "clubs",
          rankConfidence: 0.75,
          suitConfidence: 1,
          confidence: 0.75
        });
      }
    );

    it(
      "returns null when rank is not recognized",
      () => {
        const rankTemplate =
          createMask([
            1, 1,
            0, 0
          ]);

        const clubs =
          createMask([
            0, 0,
            1, 1
          ]);

        const recognizer =
          new CardRecognizer(
            new RankRecognizer(
              [
                {
                  rank: "5",
                  mask:
                  rankTemplate
                }
              ]
            ),
            new SuitRecognizer(
              [
                {
                  suit: "clubs",
                  mask:
                  clubs
                }
              ]
            )
          );

        const recognition =
          recognizer.recognize({
            rank:
              createMask([
                0, 0,
                1, 1
              ]),
            suit:
            clubs
          });

        expect(
          recognition.card
        ).toBeNull();

        expect(
          recognition.rankConfidence
        ).toBe(0);

        expect(
          recognition.suitConfidence
        ).toBe(1);
      }
    );

    it(
      "returns null when suit is not recognized",
      () => {
        const rank5 =
          createMask([
            1, 1,
            0, 0
          ]);

        const suitTemplate =
          createMask([
            0, 0,
            1, 1
          ]);

        const recognizer =
          new CardRecognizer(
            new RankRecognizer(
              [
                {
                  rank: "5",
                  mask:
                  rank5
                }
              ]
            ),
            new SuitRecognizer(
              [
                {
                  suit: "clubs",
                  mask:
                  suitTemplate
                }
              ]
            )
          );

        const recognition =
          recognizer.recognize({
            rank:
            rank5,
            suit:
              createMask([
                1, 1,
                0, 0
              ])
          });

        expect(
          recognition.card
        ).toBeNull();

        expect(
          recognition.rankConfidence
        ).toBe(1);

        expect(
          recognition.suitConfidence
        ).toBe(0);
      }
    );

    it(
      "returns null when neither symbol is recognized",
      () => {
        const recognizer =
          new CardRecognizer(
            new RankRecognizer(
              []
            ),
            new SuitRecognizer(
              []
            )
          );

        const recognition =
          recognizer.recognize({
            rank:
              createMask([
                1, 0,
                0, 1
              ]),
            suit:
              createMask([
                0, 1,
                1, 0
              ])
          });

        expect(
          recognition
        ).toEqual({
          card: null,
          rankConfidence: 0,
          suitConfidence: 0
        });
      }
    );
  }
);