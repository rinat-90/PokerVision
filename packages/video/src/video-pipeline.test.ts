import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";

import {
  processVideo
} from "./video-pipeline.js";

const fixturePath = fileURLToPath(
  new URL(
    "../fixtures/test-video.mp4",
    import.meta.url
  )
);

describe("processVideo", () => {
  it("processes a valid video end-to-end", async () => {
    const result =
      await processVideo(
        fixturePath,
        {
          frameRequest: {
            fps: 2
          }
        }
      );

    expect(result.metadata.width)
      .toBe(1280);

    expect(result.metadata.height)
      .toBe(720);

    expect(result.metadata.fps)
      .toBeCloseTo(30);

    expect(result.metadata.durationSeconds)
      .toBeCloseTo(2, 1);

    expect(result.frames)
      .toHaveLength(4);

    expect(result.frames[0]?.timestampSeconds)
      .toBeCloseTo(0);

    expect(result.frames[1]?.timestampSeconds)
      .toBeCloseTo(0.5);

    expect(result.frames[2]?.timestampSeconds)
      .toBeCloseTo(1);

    expect(result.frames[3]?.timestampSeconds)
      .toBeCloseTo(1.5);

    for (const frame of result.frames) {
      expect(frame.data.length)
        .toBeGreaterThan(0);

      expect(frame.width)
        .toBe(1280);

      expect(frame.height)
        .toBe(720);
    }
  });

  it("rejects invalid video metadata", async () => {
    await expect(
      processVideo(
        fixturePath,
        {
          maxWidth: 640
        }
      )
    ).rejects.toThrow(
      "Video validation failed"
    );
  });
});