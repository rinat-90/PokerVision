import {
  describe,
  expect,
  it
} from "vitest";

import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  DecodedImage
} from "../image/image-decoder.js";

import {
  SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import {
  WhiteCardDetector
} from "../card/white-card-detector.js";

import {
  SeatDetector
} from "./seat-detector.js";

import type {
  SeatRegion
} from "./seat-region.js";

class TestImageDecoder
  extends SharpImageDecoder {
  override async decode():
    Promise<DecodedImage> {
    return {
      width: 100,
      height: 100,
      channels: 3,
      data:
        new Uint8Array(
          100 * 100 * 3
        )
    };
  }
}

class TestCardDetector
  extends WhiteCardDetector {
  private callIndex = 0;

  override async detect() {
    const hasCards =
      this.callIndex === 0;

    this.callIndex += 1;

    return {
      found:
      hasCards,
      confidence:
        hasCards
          ? 0.5
          : 0,
      regions:
        hasCards
          ? [
            {
              x: 10,
              y: 20,
              width: 60,
              height: 40
            }
          ]
          : []
    };
  }
}

function createFrame():
  VideoFrame {
  return {
    index: 0,
    timestampSeconds: 0,
    width: 100,
    height: 100,
    data:
      new Uint8Array([
        1,
        2,
        3
      ])
  };
}

describe(
  "SeatDetector",
  () => {
    it(
      "detects card state for each seat",
      async () => {
        const decoder =
          new TestImageDecoder();

        const cardDetector =
          new TestCardDetector();

        const detector =
          new SeatDetector(
            decoder,
            cardDetector
          );

        const seatRegions:
          SeatRegion[] = [
          {
            index: 0,
            x: 0,
            y: 0,
            width: 50,
            height: 50
          },
          {
            index: 1,
            x: 50,
            y: 0,
            width: 50,
            height: 50
          }
        ];

        const result =
          await detector.detect(
            createFrame(),
            seatRegions
          );

        expect(result)
          .toHaveLength(2);

        expect(result[0])
          .toEqual({
            index: 0,
            region:
              seatRegions[0],
            hasCards: true,
            cardRegions: [
              {
                x: 10,
                y: 20,
                width: 60,
                height: 40
              }
            ],
            confidence: 0.5
          });

        expect(result[1])
          .toEqual({
            index: 1,
            region:
              seatRegions[1],
            hasCards: false,
            cardRegions: [],
            confidence: 0
          });
      }
    );
  }
);