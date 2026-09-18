import {
  describe,
  expect,
  it
} from "vitest";

import {
  findSymbolBounds
} from "./symbol-bounds.js";

import type {
  SymbolMask
} from "./symbol-mask.js";

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

function setPixel(
  mask: SymbolMask,
  x: number,
  y: number
): void {
  mask.data[
  y *
  mask.width +
  x
    ] = 1;
}

describe(
  "findSymbolBounds",
  () => {
    it(
      "returns null for an empty mask",
      () => {
        expect(
          findSymbolBounds(
            createMask(
              10,
              10
            )
          )
        ).toBeNull();
      }
    );

    it(
      "finds a single pixel",
      () => {
        const mask =
          createMask(
            10,
            10
          );

        setPixel(
          mask,
          4,
          6
        );

        expect(
          findSymbolBounds(
            mask
          )
        ).toEqual({
          x: 4,
          y: 6,
          width: 1,
          height: 1
        });
      }
    );

    it(
      "finds bounds around a symbol",
      () => {
        const mask =
          createMask(
            10,
            10
          );

        for (
          let y = 3;
          y <= 7;
          y += 1
        ) {
          for (
            let x = 2;
            x <= 5;
            x += 1
          ) {
            setPixel(
              mask,
              x,
              y
            );
          }
        }

        expect(
          findSymbolBounds(
            mask
          )
        ).toEqual({
          x: 2,
          y: 3,
          width: 4,
          height: 5
        });
      }
    );

    it(
      "includes disconnected symbol pixels",
      () => {
        const mask =
          createMask(
            20,
            20
          );

        setPixel(
          mask,
          3,
          4
        );

        setPixel(
          mask,
          12,
          15
        );

        expect(
          findSymbolBounds(
            mask
          )
        ).toEqual({
          x: 3,
          y: 4,
          width: 10,
          height: 12
        });
      }
    );

    it(
      "handles symbols touching mask edges",
      () => {
        const mask =
          createMask(
            10,
            10
          );

        setPixel(
          mask,
          0,
          0
        );

        setPixel(
          mask,
          9,
          9
        );

        expect(
          findSymbolBounds(
            mask
          )
        ).toEqual({
          x: 0,
          y: 0,
          width: 10,
          height: 10
        });
      }
    );
  }
);