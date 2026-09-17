import {
  describe,
  expect,
  it
} from "vitest";

import type {
  CroppedFrame
} from "../table/crop-frame.js";

import {
  WhiteCardDetector
} from "./white-card-detector.js";

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

  return {
    data,
    width,
    height,
    channels
  };
}

function fillRectangle(
  frame: CroppedFrame,
  x: number,
  y: number,
  width: number,
  height: number,
  value: number
): void {
  for (
    let row = y;
    row < y + height;
    row += 1
  ) {
    for (
      let column = x;
      column < x + width;
      column += 1
    ) {
      const offset =
        (
          row * frame.width +
          column
        ) *
        frame.channels;

      frame.data[offset] =
        value;

      frame.data[offset + 1] =
        value;

      frame.data[offset + 2] =
        value;
    }
  }
}

function fillLightBlueRectangle(
  frame: CroppedFrame,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  for (
    let row = y;
    row < y + height;
    row += 1
  ) {
    for (
      let column = x;
      column < x + width;
      column += 1
    ) {
      const offset =
        (
          row * frame.width +
          column
        ) *
        frame.channels;

      frame.data[offset] =
        190;

      frame.data[offset + 1] =
        220;

      frame.data[offset + 2] =
        235;
    }
  }
}

describe(
  "WhiteCardDetector",
  () => {
    it(
      "detects a white card region",
      async () => {
        const frame =
          createFrame(
            200,
            150
          );

        fillRectangle(
          frame,
          60,
          40,
          50,
          80,
          255
        );

        const detector =
          new WhiteCardDetector();

        const result =
          await detector.detect(
            frame
          );

        expect(result.found)
          .toBe(true);

        expect(result.regions)
          .toHaveLength(1);

        expect(result.regions[0])
          .toEqual({
            x: 60,
            y: 40,
            width: 50,
            height: 80
          });

        expect(result.confidence)
          .toBe(0.5);
      }
    );

    it(
      "detects a light blue closed card",
      async () => {
        const frame =
          createFrame(
            200,
            150
          );

        fillLightBlueRectangle(
          frame,
          60,
          40,
          50,
          80
        );

        const detector =
          new WhiteCardDetector();

        const result =
          await detector.detect(
            frame
          );

        expect(result.found)
          .toBe(true);

        expect(result.regions)
          .toHaveLength(1);

        expect(result.regions[0])
          .toEqual({
            x: 60,
            y: 40,
            width: 50,
            height: 80
          });
      }
    );

    it(
      "does not detect a small white region as a card",
      async () => {
        const frame =
          createFrame(
            200,
            150
          );

        fillRectangle(
          frame,
          20,
          20,
          10,
          10,
          255
        );

        const detector =
          new WhiteCardDetector();

        const result =
          await detector.detect(
            frame
          );

        expect(result.found)
          .toBe(false);

        expect(result.regions)
          .toHaveLength(0);

        expect(result.confidence)
          .toBe(0);
      }
    );

    it(
      "detects multiple card regions",
      async () => {
        const frame =
          createFrame(
            300,
            200
          );

        fillRectangle(
          frame,
          30,
          50,
          50,
          80,
          255
        );

        fillRectangle(
          frame,
          120,
          50,
          50,
          80,
          255
        );

        const detector =
          new WhiteCardDetector();

        const result =
          await detector.detect(
            frame
          );

        expect(result.found)
          .toBe(true);

        expect(result.regions)
          .toHaveLength(2);

        expect(
          result.regions
        ).toContainEqual({
          x: 30,
          y: 50,
          width: 50,
          height: 80
        });

        expect(
          result.regions
        ).toContainEqual({
          x: 120,
          y: 50,
          width: 50,
          height: 80
        });
      }
    );

    it(
      "does not detect a wide white region as a card",
      async () => {
        const frame =
          createFrame(
            300,
            200
          );

        fillRectangle(
          frame,
          50,
          60,
          120,
          40,
          255
        );

        const detector =
          new WhiteCardDetector();

        const result =
          await detector.detect(
            frame
          );

        expect(result.found)
          .toBe(false);

        expect(result.regions)
          .toHaveLength(0);
      }
    );

  }
);