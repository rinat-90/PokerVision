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
  createSixMaxSeatRegions
} from "../seat/seat-region.js";

import {
  createPlayerActionLabelRegions
} from "./player-action-label-region.js";

import {
  PlayerActionLabelRecognizer
} from "./player-action-label-recognizer.js";

describe(
  "PlayerActionLabelRecognizer on real video",
  () => {
    it(
      "recognizes visible player actions",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const startSeconds = 18;

        const frames =
          await extractFrames(
            videoPath,
            {
              startSeconds,
              endSeconds: 22,
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

        const seatRegions =
          createSixMaxSeatRegions(
            tableDetection.region,
            {
              width:
              firstFrame.width,

              height:
              firstFrame.height
            }
          );

        const labelRegions =
          createPlayerActionLabelRegions(
            seatRegions
          );

        const recognizer =
          new PlayerActionLabelRecognizer();

        const detections: Array<{
          timestampSeconds: number;
          seatIndex: number;
          label: string;
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

            const timestampSeconds =
              startSeconds +
              frameIndex;

            for (
              const region
              of labelRegions
              ) {
              const cropped =
                await cropFrame(
                  frame,
                  region,
                  decoder
                );

              const result =
                await recognizer.recognize(
                  cropped
                );

              if (!result.label) {
                continue;
              }

              detections.push({
                timestampSeconds,

                seatIndex:
                region.seatIndex,

                label:
                result.label,

                rawText:
                result.rawText,

                confidence:
                result.confidence
              });

              console.log(
                `${timestampSeconds}s S${region.seatIndex}` +
                ` label=${result.label}` +
                ` text=${JSON.stringify(result.rawText)}` +
                ` confidence=${result.confidence.toFixed(3)}`
              );
            }
          }
        } finally {
          await recognizer.terminate();
        }

        console.log(
          "ACTION LABELS:",
          detections
        );

        expect(
          detections.map(
            detection => ({
              timestampSeconds:
              detection.timestampSeconds,

              seatIndex:
              detection.seatIndex,

              label:
              detection.label
            })
          )
        ).toEqual([
          {
            timestampSeconds: 18,
            seatIndex: 2,
            label: "check"
          },
          {
            timestampSeconds: 19,
            seatIndex: 2,
            label: "check"
          },
          {
            timestampSeconds: 19,
            seatIndex: 4,
            label: "placeBet"
          },
          {
            timestampSeconds: 20,
            seatIndex: 2,
            label: "check"
          },
          {
            timestampSeconds: 20,
            seatIndex: 4,
            label: "placeBet"
          },
          {
            timestampSeconds: 21,
            seatIndex: 2,
            label: "fold"
          },
          {
            timestampSeconds: 21,
            seatIndex: 5,
            label: "call"
          }
        ]);
      }
    );
  }
);