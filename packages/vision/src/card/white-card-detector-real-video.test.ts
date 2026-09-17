import {
  describe,
  expect,
  it
} from "vitest";

import sharp, {
  type Channels
} from "sharp";

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
  PurpleTableDetector
} from "../table/purple-table-detector.js";

import {
  cropFrame
} from "../table/crop-frame.js";

import {
  WhiteCardDetector
} from "./white-card-detector.js";

describe(
  "WhiteCardDetector on real video",
  () => {
    it(
      "analyzes candidate card regions on the poker table",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const outputPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/table-crop.png",
              import.meta.url
            )
          );

        const frames =
          await extractFrames(
            videoPath,
            {
              startSeconds: 5,
              endSeconds: 6,
              fps: 1
            }
          );

        expect(frames.length)
          .toBe(1);

        const frame =
          frames[0];

        expect(frame)
          .toBeDefined();

        if (!frame) {
          throw new Error(
            "Expected a video frame"
          );
        }

        const decoder =
          new SharpImageDecoder();

        const tableDetector =
          new PurpleTableDetector(
            decoder
          );

        const tableDetection =
          await tableDetector.detect(
            frame
          );

        expect(tableDetection.found)
          .toBe(true);

        expect(tableDetection.region)
          .toBeDefined();

        if (!tableDetection.region) {
          throw new Error(
            "Expected table region"
          );
        }

        const cropped =
          await cropFrame(
            frame,
            tableDetection.region,
            decoder
          );

        expect(cropped.width)
          .toBeGreaterThan(0);

        expect(cropped.height)
          .toBeGreaterThan(0);

        await sharp(
          Buffer.from(cropped.data),
          {
            raw: {
              width: cropped.width,
              height: cropped.height,
              channels:
                cropped.channels as Channels
            }
          }
        )
          .png()
          .toFile(
            outputPath
          );

        console.log(
          "TABLE CROP SAVED:",
          outputPath
        );

        const cardDetector =
          new WhiteCardDetector({
            brightnessThreshold: 0.6,
            minWhiteRatio: 0.15,
            minWidth: 20,
            minHeight: 30,
            maxWidth: 150,
            maxHeight: 200,
            minAspectRatio: 0.45,
            maxAspectRatio: 0.85
          });

        const result =
          await cardDetector.detect(
            cropped
          );

        console.log(
          "CARD DETECTION:",
          {
            table: {
              width: cropped.width,
              height: cropped.height
            },
            found: result.found,
            confidence: result.confidence,
            regions: result.regions
          }
        );

        expect(result)
          .toEqual(
            expect.objectContaining({
              found:
                expect.any(Boolean),
              confidence:
                expect.any(Number),
              regions:
                expect.any(Array)
            })
          );
      }
    );
  }
);