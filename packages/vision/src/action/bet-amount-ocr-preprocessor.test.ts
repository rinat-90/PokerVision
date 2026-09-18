import {
  describe,
  expect,
  it
} from "vitest";

import sharp from "sharp";

import {
  BetAmountOcrPreprocessor
} from "./bet-amount-ocr-preprocessor.js";

describe(
  "BetAmountOcrPreprocessor",
  () => {
    it(
      "scales the image for OCR",
      async () => {
        const preprocessor =
          new BetAmountOcrPreprocessor({
            scale: 4
          });

        const image =
          await preprocessor.preprocess({
            width: 10,
            height: 5,
            channels: 3,
            data:
              new Uint8Array(
                10 * 5 * 3
              )
          });

        const metadata =
          await sharp(
            image
          ).metadata();

        expect(
          metadata.width
        ).toBe(40);

        expect(
          metadata.height
        ).toBe(20);

        expect(
          metadata.format
        ).toBe("png");
      }
    );

    it(
      "produces a grayscale thresholded image",
      async () => {
        const preprocessor =
          new BetAmountOcrPreprocessor({
            scale: 1,
            threshold: 128
          });

        const image =
          await preprocessor.preprocess({
            width: 2,
            height: 1,
            channels: 3,
            data:
              new Uint8Array([
                0, 0, 0,
                255, 255, 255
              ])
          });

        const {
          data,
          info
        } =
          await sharp(
            image
          )
            .raw()
            .toBuffer({
              resolveWithObject: true
            });

        expect(
          info.width
        ).toBe(2);

        expect(
          info.height
        ).toBe(1);

        expect(
          info.channels
        ).toBe(3);

        expect(
          [...data]
        ).toEqual([
          0, 0, 0,
          255, 255, 255
        ]);
      }
    );

    it(
      "rejects unsupported channel counts",
      async () => {
        const preprocessor =
          new BetAmountOcrPreprocessor();

        await expect(
          preprocessor.preprocess({
            width: 10,
            height: 10,
            channels: 1,
            data:
              new Uint8Array(
                100
              )
          })
        ).rejects.toThrow(
          "Expected RGB/RGBA image data"
        );
      }
    );

    it(
      "rejects invalid image data length",
      async () => {
        const preprocessor =
          new BetAmountOcrPreprocessor();

        await expect(
          preprocessor.preprocess({
            width: 10,
            height: 10,
            channels: 3,
            data:
              new Uint8Array(
                10
              )
          })
        ).rejects.toThrow(
          "Image data length does not match dimensions"
        );
      }
    );
  }
);