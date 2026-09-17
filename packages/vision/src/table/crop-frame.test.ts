import {
  describe,
  expect,
  it
} from "vitest";

import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  DecodedImage,
  ImageDecoder
} from "../image/image-decoder.js";

import {
  cropFrame
} from "./crop-frame.js";

function createFrame(): VideoFrame {
  return {
    index: 0,
    timestampSeconds: 0,
    width: 1280,
    height: 720,
    data: new Uint8Array([
      1,
      2,
      3
    ])
  };
}

function createDecoder(): ImageDecoder {
  const image: DecodedImage = {
    width: 1280,
    height: 720,
    channels: 3,
    data: new Uint8Array(
      1280 * 720 * 3
    )
  };

  return {
    async decode(): Promise<DecodedImage> {
      return image;
    }
  };
}

describe(
  "cropFrame",
  () => {
    it(
      "crops the requested region",
      async () => {
        const result =
          await cropFrame(
            createFrame(),
            {
              x: 100,
              y: 50,
              width: 800,
              height: 400
            },
            createDecoder()
          );

        expect(result.width)
          .toBe(800);

        expect(result.height)
          .toBe(400);

        expect(result.channels)
          .toBe(3);

        expect(result.data.length)
          .toBe(
            800 * 400 * 3
          );
      }
    );

    it(
      "clamps the region to the right and bottom",
      async () => {
        const result =
          await cropFrame(
            createFrame(),
            {
              x: 1000,
              y: 600,
              width: 500,
              height: 300
            },
            createDecoder()
          );

        expect(result.width)
          .toBe(280);

        expect(result.height)
          .toBe(120);

        expect(result.data.length)
          .toBe(
            280 * 120 * 3
          );
      }
    );

    it(
      "clamps negative coordinates",
      async () => {
        const result =
          await cropFrame(
            createFrame(),
            {
              x: -100,
              y: -50,
              width: 500,
              height: 300
            },
            createDecoder()
          );

        expect(result.width)
          .toBe(400);

        expect(result.height)
          .toBe(250);

        expect(result.data.length)
          .toBe(
            400 * 250 * 3
          );
      }
    );

    it(
      "clamps a region larger than the entire frame",
      async () => {
        const result =
          await cropFrame(
            createFrame(),
            {
              x: -100,
              y: -100,
              width: 2000,
              height: 1000
            },
            createDecoder()
          );

        expect(result.width)
          .toBe(1280);

        expect(result.height)
          .toBe(720);

        expect(result.data.length)
          .toBe(
            1280 * 720 * 3
          );
      }
    );

    it(
      "copies the correct pixels from the source image",
      async () => {
        const width = 4;
        const height = 3;
        const channels = 3;

        const sourceData =
          new Uint8Array([
            // row 0
            1, 2, 3,
            4, 5, 6,
            7, 8, 9,
            10, 11, 12,

            // row 1
            13, 14, 15,
            16, 17, 18,
            19, 20, 21,
            22, 23, 24,

            // row 2
            25, 26, 27,
            28, 29, 30,
            31, 32, 33,
            34, 35, 36
          ]);

        const decoder: ImageDecoder = {
          async decode(): Promise<DecodedImage> {
            return {
              width,
              height,
              channels,
              data: sourceData
            };
          }
        };

        const frame: VideoFrame = {
          index: 0,
          timestampSeconds: 0,
          width,
          height,
          data: new Uint8Array([
            1,
            2,
            3
          ])
        };

        const result =
          await cropFrame(
            frame,
            {
              x: 1,
              y: 1,
              width: 2,
              height: 2
            },
            decoder
          );

        expect(result.width)
          .toBe(2);

        expect(result.height)
          .toBe(2);

        expect(result.channels)
          .toBe(3);

        expect(
          Array.from(result.data)
        ).toEqual([
          // source row 1, columns 1-2
          16, 17, 18,
          19, 20, 21,

          // source row 2, columns 1-2
          28, 29, 30,
          31, 32, 33
        ]);
      }
    );
  }
);