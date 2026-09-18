import {
  describe,
  expect,
  it
} from "vitest";

import {
  RankRecognizer,
  type RankTemplate
} from "./rank-recognizer.js";

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
  "RankRecognizer",
  () => {
    it(
      "recognizes the closest rank template",
      () => {
        const templates:
          RankTemplate[] = [
          {
            rank: "2",
            mask:
              createMask([
                1, 1,
                0, 0
              ])
          },
          {
            rank: "5",
            mask:
              createMask([
                0, 0,
                1, 1
              ])
          }
        ];

        const recognizer =
          new RankRecognizer(
            templates
          );

        expect(
          recognizer.recognize(
            createMask([
              1, 1,
              0, 0
            ])
          )
        ).toEqual({
          rank: "2",
          confidence: 1
        });
      }
    );

    it(
      "recognizes another rank",
      () => {
        const recognizer =
          new RankRecognizer(
            [
              {
                rank: "2",
                mask:
                  createMask([
                    1, 1,
                    0, 0
                  ])
              },
              {
                rank: "5",
                mask:
                  createMask([
                    0, 0,
                    1, 1
                  ])
              }
            ]
          );

        expect(
          recognizer.recognize(
            createMask([
              0, 0,
              1, 1
            ])
          )
        ).toEqual({
          rank: "5",
          confidence: 1
        });
      }
    );

    it(
      "returns null below minimum confidence",
      () => {
        const recognizer =
          new RankRecognizer(
            [
              {
                rank: "2",
                mask:
                  createMask([
                    1, 1,
                    0, 0
                  ])
              }
            ],
            {
              minimumConfidence:
                0.9
            }
          );

        expect(
          recognizer.recognize(
            createMask([
              0, 0,
              1, 1
            ])
          )
        ).toEqual({
          rank: null,
          confidence: 0
        });
      }
    );

    it(
      "returns null when there are no templates",
      () => {
        const recognizer =
          new RankRecognizer(
            []
          );

        expect(
          recognizer.recognize(
            createMask([
              1, 1,
              0, 0
            ])
          )
        ).toEqual({
          rank: null,
          confidence: 0
        });
      }
    );

    it(
      "supports a custom confidence threshold",
      () => {
        const recognizer =
          new RankRecognizer(
            [
              {
                rank: "6",
                mask:
                  createMask([
                    1, 1,
                    0, 0
                  ])
              }
            ],
            {
              minimumConfidence:
                0.7
            }
          );

        expect(
          recognizer.recognize(
            createMask([
              1, 1,
              0, 1
            ])
          )
        ).toEqual({
          rank: "6",
          confidence: 0.75
        });
      }
    );
  }
);