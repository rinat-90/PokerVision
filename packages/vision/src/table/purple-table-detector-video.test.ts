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

describe(
  "PurpleTableDetector on real video",
  () => {
    it(
      "detects the table across multiple frames",
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
              endSeconds: 25,
              fps: 0.25
            }
          );

        const detector =
          new PurpleTableDetector(
            new SharpImageDecoder()
          );

        expect(frames.length)
          .toBeGreaterThan(1);

        for (
          const frame of frames
          ) {
          const result =
            await detector.detect(
              frame
            );

          console.log(
            `FRAME ${frame.index} ` +
            `@ ${frame.timestampSeconds.toFixed(2)}s:`,
            result
          );

          expect(result.found)
            .toBe(true);

          expect(result.region)
            .toBeDefined();
        }
      }
    );
  }
);