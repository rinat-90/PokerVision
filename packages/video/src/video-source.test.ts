import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";

import {
  FileVideoSource
} from "./video-source.js";

const fixturePath = fileURLToPath(
  new URL(
    "../fixtures/test-video.mp4",
    import.meta.url
  )
);

describe("FileVideoSource", () => {
  it("reads metadata", async () => {
    const source =
      new FileVideoSource(fixturePath);

    const metadata =
      await source.getMetadata();

    expect(metadata.width).toBe(1280);
    expect(metadata.height).toBe(720);
    expect(metadata.fps).toBeCloseTo(30);
    expect(metadata.durationSeconds)
      .toBeCloseTo(2, 1);
    expect(metadata.frameCount)
      .toBeGreaterThan(0);
  });

  it("extracts frames", async () => {
    const source =
      new FileVideoSource(fixturePath);

    const frames =
      await source.getFrames({
        fps: 2
      });

    expect(frames).toHaveLength(4);

    expect(frames[0]?.timestampSeconds)
      .toBeCloseTo(0);

    expect(frames[1]?.timestampSeconds)
      .toBeCloseTo(0.5);

    expect(frames[2]?.timestampSeconds)
      .toBeCloseTo(1);

    expect(frames[3]?.timestampSeconds)
      .toBeCloseTo(1.5);

    for (const frame of frames) {
      expect(frame.data.length)
        .toBeGreaterThan(0);

      expect(frame.width)
        .toBe(1280);

      expect(frame.height)
        .toBe(720);
    }
  });
});