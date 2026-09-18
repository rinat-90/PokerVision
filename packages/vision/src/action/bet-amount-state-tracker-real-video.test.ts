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

import {
  BetAmountStateTracker
} from "./bet-amount-state-tracker.js";

describe(
  "BetAmountStateTracker on real video",
  () => {
    it(
      "tracks stable amount transitions independently per seat",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const frames =
          await extractFrames(
            videoPath,
            {
              startSeconds: 0,
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

        const recognizer =
          new BetAmountRecognizer();

        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        const transitions: Array<{
          timestampSeconds: number;
          seatIndex: number;
          hasAmount: boolean;
          confidence: number;
        }> = [];

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

          const states = [];

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

            states.push({
              seatIndex:
              region.seatIndex,

              hasAmount:
              recognition.hasText,

              confidence:
              recognition.confidence
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
              timestampSeconds:
              frameIndex,

              seatIndex:
              change.seatIndex,

              hasAmount:
              change.hasAmount,

              confidence:
              change.confidence
            });

            console.log(
              `${frameIndex}s S${change.seatIndex} -> ${
                change.hasAmount
                  ? "appeared"
                  : "cleared"
              } confidence=${change.confidence.toFixed(3)}`
            );
          }
        }

        console.log(
          "TRANSITIONS:",
          transitions
        );

        expect(
          transitions
        ).toEqual([
          {
            timestampSeconds: 12,
            seatIndex: 5,
            hasAmount: true,
            confidence: 1
          }
        ]);
      }
    );
  }
);