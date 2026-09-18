import {
  describe,
  expect,
  it
} from "vitest";

import {
  SuitRecognizer,
  type SuitTemplate
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
  "SuitRecognizer",
  () => {
    it(
      "recognizes the closest template",
      () => {
        const templates:
          SuitTemplate[] = [
          {
            suit: "hearts",
            mask:
              createMask([
                1, 1,
                0, 0
              ])
          },
          {
            suit: "clubs",
            mask:
              createMask([
                0, 0,
                1, 1
              ])
          }
        ];

        const recognizer =
          new SuitRecognizer(
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
          suit: "hearts",
          confidence: 1
        });
      }
    );

    it(
      "recognizes another suit",
      () => {
        const templates:
          SuitTemplate[] = [
          {
            suit: "hearts",
            mask:
              createMask([
                1, 1,
                0, 0
              ])
          },
          {
            suit: "clubs",
            mask:
              createMask([
                0, 0,
                1, 1
              ])
          }
        ];

        const recognizer =
          new SuitRecognizer(
            templates
          );

        expect(
          recognizer.recognize(
            createMask([
              0, 0,
              1, 1
            ])
          )
        ).toEqual({
          suit: "clubs",
          confidence: 1
        });
      }
    );

    it(
      "returns null below minimum confidence",
      () => {
        const recognizer =
          new SuitRecognizer(
            [
              {
                suit: "hearts",
                mask:
                  createMask([
                    1, 1,
                    0, 0
                  ])
              }
            ],
            {
              minimumConfidence:
                0.8
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
          suit: null,
          confidence: 0
        });
      }
    );

    it(
      "returns null when there are no templates",
      () => {
        const recognizer =
          new SuitRecognizer(
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
          suit: null,
          confidence: 0
        });
      }
    );

    it(
      "supports a custom confidence threshold",
      () => {
        const recognizer =
          new SuitRecognizer(
            [
              {
                suit: "hearts",
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
          suit: "hearts",
          confidence: 0.75
        });
      }
    );
  }
);