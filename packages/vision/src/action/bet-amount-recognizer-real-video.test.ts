import {
  describe,
  expect,
  it
} from "vitest";

import {
  fileURLToPath
} from "node:url";

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
  "BetAmountRecognizer on real video",
  () => {
    it(
      "measures text-like pixels throughout the hand",
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
            brightnessThreshold:
              0.75,
            minimumPixelRatio:
              0.01
          });

        const timestamps =
          Array.from(
            {
              length: 30
            },
            (_, index) => index
          );

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

          if (
            !tableDetection.region
          ) {
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

          const results: string[] =
            [];

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

            results.push(
              `S${region.seatIndex}=` +
              `${recognition.matchingPixelRatio.toFixed(5)}` +
              `${recognition.hasText ? "*" : ""}`
            );
          }

          console.log(
            `${timestampSeconds}s ` +
            results.join(" ")
          );
        }

        expect(
          timestamps
        ).toHaveLength(30);
      }
    );
  }
);