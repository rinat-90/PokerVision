import {
  describe,
  expect,
  it
} from "vitest";

import {
  normalizeSymbolMask
} from "./normalize-symbol-mask.js";

import type {
  SymbolMask
} from "./symbol-mask.js";

import {
  findSymbolBounds
} from "./symbol-bounds.js";

function createMask(
  width: number,
  height: number
): SymbolMask {
  return {
    width,
    height,
    data:
      new Uint8Array(
        width *
        height
      )
  };
}

function fillRect(
  mask: SymbolMask,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  for (
    let currentY = y;
    currentY < y + height;
    currentY += 1
  ) {
    for (
      let currentX = x;
      currentX < x + width;
      currentX += 1
    ) {
      mask.data[
      currentY *
      mask.width +
      currentX
        ] = 1;
    }
  }
}

describe(
  "normalizeSymbolMask",
  () => {
    it(
      "creates a 24x24 mask by default",
      () => {
        const mask =
          createMask(
            42,
            32
          );

        fillRect(
          mask,
          10,
          5,
          20,
          20
        );

        const normalized =
          normalizeSymbolMask(
            mask
          );

        expect(
          normalized.width
        ).toBe(24);

        expect(
          normalized.height
        ).toBe(24);

        expect(
          normalized.data.length
        ).toBe(
          24 * 24
        );
      }
    );

    it(
      "returns an empty mask for an empty symbol",
      () => {
        const normalized =
          normalizeSymbolMask(
            createMask(
              42,
              32
            )
          );

        expect(
          Array.from(
            normalized.data
          ).every(
            value =>
              value === 0
          )
        ).toBe(true);
      }
    );

    it(
      "centers a square symbol",
      () => {
        const mask =
          createMask(
            42,
            32
          );

        fillRect(
          mask,
          5,
          3,
          20,
          20
        );

        const normalized =
          normalizeSymbolMask(
            mask
          );

        expect(
          findSymbolBounds(
            normalized
          )
        ).toEqual({
          x: 2,
          y: 2,
          width: 20,
          height: 20
        });
      }
    );

    it(
      "preserves a wide aspect ratio",
      () => {
        const mask =
          createMask(
            40,
            20
          );

        fillRect(
          mask,
          5,
          5,
          20,
          10
        );

        const normalized =
          normalizeSymbolMask(
            mask
          );

        expect(
          findSymbolBounds(
            normalized
          )
        ).toEqual({
          x: 2,
          y: 7,
          width: 20,
          height: 10
        });
      }
    );

    it(
      "supports custom target dimensions",
      () => {
        const mask =
          createMask(
            20,
            20
          );

        fillRect(
          mask,
          2,
          2,
          16,
          16
        );

        const normalized =
          normalizeSymbolMask(
            mask,
            {
              width: 32,
              height: 32,
              padding: 4
            }
          );

        expect(
          normalized.width
        ).toBe(32);

        expect(
          normalized.height
        ).toBe(32);

        expect(
          findSymbolBounds(
            normalized
          )
        ).toEqual({
          x: 4,
          y: 4,
          width: 24,
          height: 24
        });
      }
    );
  }
);