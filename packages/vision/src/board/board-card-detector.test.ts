import {
  describe,
  expect,
  it
} from "vitest";

import {
  BoardCardDetector
} from "./board-card-detector.js";

import type {
  CroppedFrame
} from "../table/crop-frame.js";

function createFrame():
  CroppedFrame {
  const width = 700;
  const height = 220;
  const channels = 3;

  const data =
    new Uint8Array(
      width *
      height *
      channels
    );

  return {
    width,
    height,
    channels,
    data
  };
}

function drawWhiteCard(
  frame: CroppedFrame,
  x: number,
  y: number
): void {
  const width = 100;
  const height = 150;

  for (
    let py = y;
    py < y + height;
    py += 1
  ) {
    for (
      let px = x;
      px < x + width;
      px += 1
    ) {
      const offset =
        (
          py *
          frame.width +
          px
        ) *
        frame.channels;

      frame.data[offset] =
        255;

      frame.data[
      offset + 1
        ] = 255;

      frame.data[
      offset + 2
        ] = 255;
    }
  }
}

function drawCards(
  frame: CroppedFrame,
  count: number
): void {
  for (
    let index = 0;
    index < count;
    index += 1
  ) {
    drawWhiteCard(
      frame,
      40 +
      index * 120,
      30
    );
  }
}

describe(
  "BoardCardDetector",
  () => {
    it(
      "detects no cards",
      () => {
        const detector =
          new BoardCardDetector();

        const result =
          detector.detect(
            createFrame()
          );

        expect(result)
          .toEqual({
            count: 0,
            regions: []
          });
      }
    );

    it(
      "detects three flop cards",
      () => {
        const frame =
          createFrame();

        drawCards(
          frame,
          3
        );

        const detector =
          new BoardCardDetector();

        const result =
          detector.detect(
            frame
          );

        expect(result.count)
          .toBe(3);

        expect(result.regions)
          .toHaveLength(3);
      }
    );

    it(
      "detects four turn cards",
      () => {
        const frame =
          createFrame();

        drawCards(
          frame,
          4
        );

        const detector =
          new BoardCardDetector();

        expect(
          detector.detect(
            frame
          ).count
        ).toBe(4);
      }
    );

    it(
      "detects five river cards",
      () => {
        const frame =
          createFrame();

        drawCards(
          frame,
          5
        );

        const detector =
          new BoardCardDetector();

        expect(
          detector.detect(
            frame
          ).count
        ).toBe(5);
      }
    );

    it(
      "ignores small white noise",
      () => {
        const frame =
          createFrame();

        drawWhiteCard(
          frame,
          40,
          30
        );

        for (
          let y = 5;
          y < 15;
          y += 1
        ) {
          for (
            let x = 600;
            x < 610;
            x += 1
          ) {
            const offset =
              (
                y *
                frame.width +
                x
              ) *
              frame.channels;

            frame.data[offset] =
              255;

            frame.data[
            offset + 1
              ] = 255;

            frame.data[
            offset + 2
              ] = 255;
          }
        }

        const detector =
          new BoardCardDetector();

        expect(
          detector.detect(
            frame
          ).count
        ).toBe(1);
      }
    );
  }
);