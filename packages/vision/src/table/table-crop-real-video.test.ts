import {
  describe,
  expect,
  it
} from "vitest";

import {
  extractFrames
} from "@poker-vision/video";

import {
  SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import {
  PurpleTableDetector
} from "./purple-table-detector.js";

import {
  cropFrame
} from "./crop-frame.js";

describe(
  "real table crop",
  () => {
    it(
      "detects and crops the poker table",
      async () => {
        const videoPath =
          new URL(
            "../../../video/fixtures/real/poker-table.mp4",
            import.meta.url
          );

        const frames =
          await extractFrames(
            videoPath.pathname,
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

        const detector =
          new PurpleTableDetector(
            decoder
          );

        const detection =
          await detector.detect(
            frame
          );

        expect(detection.found)
          .toBe(true);

        expect(detection.region)
          .toBeDefined();

        if (!detection.region) {
          throw new Error(
            "Expected table region"
          );
        }

        const cropped =
          await cropFrame(
            frame,
            detection.region,
            decoder
          );

        console.log(
          "TABLE CROP:",
          {
            source: {
              width: frame.width,
              height: frame.height
            },
            region: detection.region,
            cropped: {
              width: cropped.width,
              height: cropped.height,
              channels: cropped.channels,
              dataLength: cropped.data.length
            }
          }
        );

        expect(cropped.width)
          .toBeGreaterThan(1000);

        expect(cropped.height)
          .toBeGreaterThan(300);

        expect(cropped.channels)
          .toBeGreaterThanOrEqual(3);

        expect(cropped.data.length)
          .toBe(
            cropped.width *
            cropped.height *
            cropped.channels
          );
      }
    );
  }
);