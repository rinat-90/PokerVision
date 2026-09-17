import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";

import {
  extractFrames
} from "./frame-extractor.js";

const fixturePath = fileURLToPath(
  new URL(
    "../fixtures/test-video.mp4",
    import.meta.url
  )
);

describe("extractFrames", () => {
  it("extracts JPEG frames with timestamps", async () => {
    const frames =
      await extractFrames(
        fixturePath,
        {
          fps: 2
        }
      );

    expect(frames).toHaveLength(4);

    expect(frames[0]?.index)
      .toBe(0);

    expect(frames[0]?.timestampSeconds)
      .toBeCloseTo(0);

    expect(frames[1]?.timestampSeconds)
      .toBeCloseTo(0.5);

    expect(frames[2]?.timestampSeconds)
      .toBeCloseTo(1);

    expect(frames[3]?.timestampSeconds)
      .toBeCloseTo(1.5);

    for (const frame of frames) {
      expect(frame.width)
        .toBe(1280);

      expect(frame.height)
        .toBe(720);

      expect(frame.data.length)
        .toBeGreaterThan(0);

      expect(frame.data[0])
        .toBe(0xff);

      expect(frame.data[1])
        .toBe(0xd8);

      const lastIndex =
        frame.data.length - 2;

      expect(frame.data[lastIndex])
        .toBe(0xff);

      expect(frame.data[lastIndex + 1])
        .toBe(0xd9);
    }
  });

  it("supports a time range", async () => {
    const frames =
      await extractFrames(
        fixturePath,
        {
          startSeconds: 0.5,
          endSeconds: 1.5,
          fps: 2
        }
      );

    expect(frames).toHaveLength(2);

    expect(frames[0]?.timestampSeconds)
      .toBeCloseTo(0.5);

    expect(frames[1]?.timestampSeconds)
      .toBeCloseTo(1);
  });

  it("rejects invalid FPS", async () => {
    await expect(
      extractFrames(
        fixturePath,
        {
          fps: 0
        }
      )
    ).rejects.toThrow(
      "FPS must be greater than 0"
    );
  });
  it("throws when the video file does not exist", async () => {
    await expect(
      extractFrames(
        "/tmp/poker-vision-video-that-does-not-exist.mp4"
      )
    ).rejects.toThrow();
  });
});