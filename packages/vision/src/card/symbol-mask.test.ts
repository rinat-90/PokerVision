import {
  describe,
  expect,
  it
} from "vitest";

import {
  createSymbolMask
} from "./symbol-mask.js";

import type {
  CroppedFrame
} from "../table/crop-frame.js";

function createFrame(
  width: number,
  height: number
): CroppedFrame {
  const channels = 3;

  const data =
    new Uint8Array(
      width *
      height *
      channels
    );

  data.fill(255);

  return {
    width,
    height,
    channels,
    data
  };
}

function setPixel(
  frame: CroppedFrame,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number
): void {
  const offset =
    (
      y *
      frame.width +
      x
    ) *
    frame.channels;

  frame.data[offset] =
    r;

  frame.data[
  offset + 1
    ] = g;

  frame.data[
  offset + 2
    ] = b;
}

describe(
  "createSymbolMask",
  () => {
    it(
      "keeps white background empty",
      () => {
        const mask =
          createSymbolMask(
            createFrame(
              4,
              4
            )
          );

        expect(
          Array.from(
            mask.data
          )
        ).toEqual(
          new Array(16)
            .fill(0)
        );
      }
    );

    it(
      "detects a black symbol pixel",
      () => {
        const frame =
          createFrame(
            3,
            3
          );

        setPixel(
          frame,
          1,
          1,
          0,
          0,
          0
        );

        const mask =
          createSymbolMask(
            frame
          );

        expect(
          mask.data[4]
        ).toBe(1);
      }
    );

    it(
      "detects a red symbol pixel",
      () => {
        const frame =
          createFrame(
            3,
            3
          );

        setPixel(
          frame,
          1,
          1,
          200,
          20,
          30
        );

        const mask =
          createSymbolMask(
            frame
          );

        expect(
          mask.data[4]
        ).toBe(1);
      }
    );

    it(
      "ignores bright background pixels",
      () => {
        const frame =
          createFrame(
            3,
            3
          );

        setPixel(
          frame,
          1,
          1,
          245,
          245,
          245
        );

        const mask =
          createSymbolMask(
            frame
          );

        expect(
          mask.data[4]
        ).toBe(0);
      }
    );

    it(
      "preserves frame dimensions",
      () => {
        const mask =
          createSymbolMask(
            createFrame(
              42,
              32
            )
          );

        expect(mask.width)
          .toBe(42);

        expect(mask.height)
          .toBe(32);

        expect(
          mask.data.length
        ).toBe(
          42 * 32
        );
      }
    );
  }
);