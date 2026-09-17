import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";

import { probeVideo } from "./video-probe.js";

const fixturePath = fileURLToPath(
  new URL(
    "../fixtures/test-video.mp4",
    import.meta.url
  )
);

describe("probeVideo", () => {
  it("reads video metadata", async () => {
    const metadata =
      await probeVideo(fixturePath);

    expect(metadata.width).toBe(1280);
    expect(metadata.height).toBe(720);
    expect(metadata.fps).toBeCloseTo(30);
    expect(metadata.durationSeconds)
      .toBeCloseTo(2, 1);
    expect(metadata.frameCount)
      .toBeGreaterThan(0);
    expect(metadata.codec).toBe("h264");
    expect(metadata.format)
      .toContain("mp4");
  });
  it("throws when the video file does not exist", async () => {
    await expect(
      probeVideo(
        "/tmp/poker-vision-video-that-does-not-exist.mp4"
      )
    ).rejects.toThrow();
  });
});