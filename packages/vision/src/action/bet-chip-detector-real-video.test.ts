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
  BetChipDetector
} from "./bet-chip-detector.js";

describe(
  "BetChipDetector on real video",
  () => {
    it(
      "detects visible bet chips",
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

        const detector =
          new BetChipDetector();

        const expectations =
          new Map<
            number,
            number[]
          >([
            [
              5,
              [1, 2]
            ],
            [
              7,
              [1, 2, 4]
            ],
            [
              8,
              [1, 2, 4, 5]
            ],
            [
              12,
              []
            ],
            [
              19,
              [4]
            ],
            [
              22,
              []
            ],
            [
              24,
              [4]
            ],
            [
              26,
              []
            ]
          ]);

        for (
          const [
            timestampSeconds,
            expectedSeats
          ] of expectations
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

          const tableDetector =
            new PurpleTableDetector(
              decoder
            );

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

          const regions =
            createPlayerActionRegions(
              tableDetection.region
            );

          const detectedSeats: number[] =
            [];

          for (
            const region of regions
            ) {
            const cropped =
              await cropFrame(
                frame,
                region,
                decoder
              );

            const detection =
              detector.detect(
                cropped
              );

            if (
              detection.present
            ) {
              detectedSeats.push(
                region.seatIndex
              );
            }
          }

          expect(
            detectedSeats,
            `${timestampSeconds}s`
          ).toEqual(
            expectedSeats
          );
        }
      }
    );
  }
);