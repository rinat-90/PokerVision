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

import {
  BetAmountStateTracker
} from "./bet-amount-state-tracker.js";

describe(
  "BetAmountStateTracker on real video",
  () => {
    it(
      "tracks stable numeric bet amounts independently per seat",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const startSeconds = 0;

        const frames =
          await extractFrames(
            videoPath,
            {
              startSeconds,
              endSeconds: 30,
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

        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        const transitions: Array<{
          timestampSeconds: number;
          seatIndex: number;
          previousAmount: number | null;
          currentAmount: number | null;
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

            const timestampSeconds =
              startSeconds +
              frameIndex;

            const states = [];

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

              /*
               * If there is no chip, we already
               * know the amount is absent and can
               * avoid the amount crop/OCR entirely.
               */
              const chipDetection =
                detector.detect;

              const amountFrame =
                await cropFrame(
                  frame,
                  amountRegion,
                  decoder
                );

              const detection =
                await detector.detect(
                  actionFrame,
                  amountFrame,
                  actionRegion.seatIndex
                );

              states.push({
                seatIndex:
                detection.seatIndex,

                amount:
                  detection.chipPresent
                    ? detection.amount
                    : null,

                rawText:
                  detection.chipPresent
                    ? detection.rawText
                    : null,

                confidence:
                detection.confidence
              });
            }

            const result =
              tracker.update(
                states
              );

            for (
              const change
              of result.changes
              ) {
              transitions.push({
                timestampSeconds,

                seatIndex:
                change.seatIndex,

                previousAmount:
                change.previousAmount,

                currentAmount:
                change.currentAmount,

                confidence:
                change.confidence
              });

              console.log(
                `${timestampSeconds}s S${change.seatIndex} ${change.previousAmount ?? "null"} -> ${change.currentAmount ?? "null"} confidence=${change.confidence.toFixed(3)}`
              );
            }
          }
        } finally {
          await ocr.terminate();
        }

        console.log(
          "TRANSITIONS:",
          transitions
        );

        expect(
          transitions
        ).toEqual([
          {
            timestampSeconds: 8,
            seatIndex: 4,
            previousAmount: null,
            currentAmount: 600,
            confidence: 0.36
          },
          {
            timestampSeconds: 12,
            seatIndex: 2,
            previousAmount: 200,
            currentAmount: null,
            confidence: 0
          },
          {
            timestampSeconds: 13,
            seatIndex: 4,
            previousAmount: 600,
            currentAmount: null,
            confidence: 0
          },
          {
            timestampSeconds: 20,
            seatIndex: 4,
            previousAmount: null,
            currentAmount: 1900,
            confidence: 0
          },
          {
            timestampSeconds: 22,
            seatIndex: 4,
            previousAmount: 1900,
            currentAmount: null,
            confidence: 0
          },
          {
            timestampSeconds: 25,
            seatIndex: 4,
            previousAmount: null,
            currentAmount: 5700,
            confidence: 0.23
          },
          {
            timestampSeconds: 27,
            seatIndex: 4,
            previousAmount: 5700,
            currentAmount: null,
            confidence: 0
          }
        ]);
      }
    );
  }
);