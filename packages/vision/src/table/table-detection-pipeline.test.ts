import {
  describe,
  expect,
  it
} from "vitest";

import {
  detectTablesInVideo,
  PurpleTableDetector,
  SharpImageDecoder
} from "../index.js";

describe(
  "detectTablesInVideo",
  () => {
    it(
      "detects tables across a video",
      async () => {
        const videoPath =
          new URL(
            "../../../video/fixtures/real/poker-table.mp4",
            import.meta.url
          );

        const detector =
          new PurpleTableDetector(
            new SharpImageDecoder()
          );

        const results =
          await detectTablesInVideo(
            videoPath.pathname,
            detector,
            {
              frameRequest: {
                startSeconds: 5,
                endSeconds: 25,
                fps: 0.25
              }
            }
          );

        expect(results.length)
          .toBeGreaterThan(1);

        for (
          const result of results
          ) {
          expect(result.detection.found)
            .toBe(true);

          expect(result.detection.region)
            .toBeDefined();

          expect(
            result.detection.region?.width
          ).toBeGreaterThan(1000);

          expect(
            result.detection.region?.height
          ).toBeGreaterThan(300);
        }
      }
    );
  }
);