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
  TesseractBetAmountOcr
} from "./bet-amount-ocr.js";

import {
  BetAmountDetector
} from "./bet-amount-detector.js";

describe(
  "BetAmountDetector on real video",
  () => {
    it(
      "recognizes bet amounts only when a bet chip is present",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const startSeconds = 8;

        const frames =
          await extractFrames(
            videoPath,
            {
              startSeconds,
              endSeconds: 26,
              fps: 1
            }
          );

        const firstFrame =
          frames[0];

        if (!firstFrame) {
          throw new Error(
            "Expected video frames"
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
            firstFrame
          );

        if (!tableDetection.region) {
          throw new Error(
            "Expected table region"
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

        const ocr =
          new TesseractBetAmountOcr();

        const detector =
          new BetAmountDetector(
            ocr
          );

        const detections: Array<{
          timestampSeconds: number;
          seatIndex: number;
          amount: number | null;
          rawText: string | null;
          confidence: number;
        }> = [];

        try {
          for (
            let frameIndex = 0;
            frameIndex < frames.length;
            frameIndex += 1
          ) {
            const frame =
              frames[frameIndex];

            if (!frame) {
              continue;
            }

            const timestamp =
              startSeconds +
              frameIndex;

            for (
              const actionRegion
              of actionRegions
              ) {
              const amountRegion =
                amountRegions.find(
                  region =>
                    region.seatIndex ===
                    actionRegion.seatIndex
                );

              if (!amountRegion) {
                throw new Error(
                  `Expected amount region for seat ${actionRegion.seatIndex}`
                );
              }

              const actionFrame =
                await cropFrame(
                  frame,
                  actionRegion,
                  decoder
                );

              const amountFrame =
                await cropFrame(
                  frame,
                  amountRegion,
                  decoder
                );

              const result =
                await detector.detect(
                  actionFrame,
                  amountFrame,
                  actionRegion.seatIndex
                );

              if (
                !result.chipPresent
              ) {
                continue;
              }

              detections.push({
                timestampSeconds:
                timestamp,
                seatIndex:
                result.seatIndex,
                amount:
                result.amount,
                rawText:
                result.rawText,
                confidence:
                result.confidence
              });

              console.log(
                `${timestamp}s S${result.seatIndex} chip=true text=${JSON.stringify(result.rawText)} value=${result.amount} confidence=${result.confidence.toFixed(3)}`
              );
            }
          }
        } finally {
          await ocr.terminate();
        }

        expect(
          frames.length
        ).toBeGreaterThan(0);

        expect(
          detections.length
        ).toBeGreaterThan(0);

        expect(
          detections.some(
            detection =>
              detection.seatIndex === 0
          )
        ).toBe(false);
      }
    );
  }
);