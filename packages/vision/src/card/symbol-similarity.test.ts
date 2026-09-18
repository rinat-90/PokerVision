import {
  describe,
  expect,
  it
} from "vitest";

import {
  symbolSimilarity
} from "./symbol-similarity.js";

import type {
  SymbolMask
} from "./symbol-mask.js";

function createMask(
  values: number[],
  width: number,
  height: number
): SymbolMask {
  return {
    width,
    height,
    data:
      Uint8Array.from(
        values
      )
  };
}

describe(
  "symbolSimilarity",
  () => {
    it(
      "returns 1 for identical masks",
      () => {
        const first =
          createMask(
            [
              0, 1,
              1, 0
            ],
            2,
            2
          );

        const second =
          createMask(
            [
              0, 1,
              1, 0
            ],
            2,
            2
          );

        expect(
          symbolSimilarity(
            first,
            second
          )
        ).toBe(1);
      }
    );

    it(
      "returns 0 for completely opposite masks",
      () => {
        const first =
          createMask(
            [
              0, 0,
              0, 0
            ],
            2,
            2
          );

        const second =
          createMask(
            [
              1, 1,
              1, 1
            ],
            2,
            2
          );

        expect(
          symbolSimilarity(
            first,
            second
          )
        ).toBe(0);
      }
    );

    it(
      "returns partial similarity",
      () => {
        const first =
          createMask(
            [
              1, 1,
              0, 0
            ],
            2,
            2
          );

        const second =
          createMask(
            [
              1, 0,
              0, 0
            ],
            2,
            2
          );

        expect(
          symbolSimilarity(
            first,
            second
          )
        ).toBe(0.75);
      }
    );

    it(
      "returns 0 for different dimensions",
      () => {
        const first =
          createMask(
            [1, 0],
            2,
            1
          );

        const second =
          createMask(
            [1, 0],
            1,
            2
          );

        expect(
          symbolSimilarity(
            first,
            second
          )
        ).toBe(0);
      }
    );
  }
);