import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";

import {
  extractFrames
} from "@poker-vision/video";

import {
  SharpImageDecoder
} from "./sharp-image-decoder.js";

const fixturePath = fileURLToPath(
  new URL(
    "../../../video/fixtures/test-video.mp4",
    import.meta.url
  )
);

describe("SharpImageDecoder", () => {
  it("decodes a JPEG frame into raw pixels", async () => {
    const frames =
      await extractFrames(
        fixturePath,
        {
          fps: 1
        }
      );

    const frame = frames[0];

    expect(frame)
      .toBeDefined();

    const decoder =
      new SharpImageDecoder();

    const image =
      await decoder.decode(
        frame!.data
      );

    expect(image.width)
      .toBe(1280);

    expect(image.height)
      .toBe(720);

    expect(image.channels)
      .toBeGreaterThanOrEqual(3);

    expect(image.data.length)
      .toBe(
        image.width *
        image.height *
        image.channels
      );
  });

  it("rejects invalid image data", async () => {
    const decoder =
      new SharpImageDecoder();

    await expect(
      decoder.decode(
        new Uint8Array([
          1,
          2,
          3,
          4
        ])
      )
    ).rejects.toThrow();
  });
});