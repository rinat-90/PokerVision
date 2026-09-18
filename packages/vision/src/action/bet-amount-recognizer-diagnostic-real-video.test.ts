import {
  describe,
  it
} from "vitest";

import {
  fileURLToPath
} from "node:url";

import sharp, {
  type Channels
} from "sharp";

import {
  extractFrames
} from "@poker-vision/video";

import {
  SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import {
  cropFrame
} from "../table/crop-frame.js";

import {
  PurpleTableDetector
} from "../table/purple-table-detector.js";

import {
  createPlayerActionRegions
} from "./player-action-region.js";

import {
  createBetAmountRegions
} from "./bet-amount-region.js";

import {
  BetAmountRecognizer
} from "./bet-amount-recognizer.js";

describe(
  "BetAmountRecognizer diagnostic on real video",
  () => {
    it(
      "saves amount crops around the detected transition",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const decoder =
          new SharpImageDecoder();

        const tableDetector =
          new PurpleTableDetector(
            decoder
          );

        const recognizer =
          new BetAmountRecognizer({
            minimumPixelRatio: 0.01
          });

        const timestamps = [
          10,
          11,
          12,
          13,
          14
        ];

        for (
          const timestampSeconds
          of timestamps
          ) {
          const frames =
            await extractFrames(
              videoPath,
              {
                startSeconds:
                timestampSeconds,
                endSeconds:
                  timestampSeconds + 1,
                fps: 1
              }
            );

          const frame =
            frames[0];

          if (!frame) {
            throw new Error(
              `Expected frame at ${timestampSeconds}s`
            );
          }

          const tableDetection =
            await tableDetector.detect(
              frame
            );

          if (!tableDetection.region) {
            throw new Error(
              `Expected table at ${timestampSeconds}s`
            );
          }

          const actionRegions =
            createPlayerActionRegions(
              tableDetection.region
            );

          const amountRegions =
            createBetAmountRegions(
              actionRegions
            );

          for (
            const region
            of amountRegions
            ) {
            const cropped =
              await cropFrame(
                frame,
                region,
                decoder
              );

            const recognition =
              recognizer.recognize(
                cropped,
                region.seatIndex
              );

            console.log(
              `${timestampSeconds}s S${region.seatIndex} ` +
              `hasText=${recognition.hasText} ` +
              `ratio=${recognition.matchingPixelRatio.toFixed(5)} ` +
              `confidence=${recognition.confidence.toFixed(3)}`
            );

            const outputPath =
              fileURLToPath(
                new URL(
                  `../../../video/fixtures/real/bet-amount-${timestampSeconds}s-seat-${region.seatIndex}.png`,
                  import.meta.url
                )
              );

            await sharp(
              cropped.data,
              {
                raw: {
                  width:
                  cropped.width,
                  height:
                  cropped.height,
                  channels:
                    cropped.channels as Channels
                }
              }
            )
              .png()
              .toFile(
                outputPath
              );
          }
        }
      }
    );
  }
);