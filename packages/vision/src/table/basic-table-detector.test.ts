import { describe, expect, it } from "vitest";

import {
  BasicTableDetector
} from "./basic-table-detector.js";

import type {
  VideoFrame
} from "@poker-vision/video";

function createFrame(): VideoFrame {
  return {
    index: 0,
    timestampSeconds: 0,
    data: new Uint8Array([
      0xff,
      0xd8,
      0xff,
      0xd9
    ]),
    width: 1280,
    height: 720
  };
}

describe("BasicTableDetector", () => {
  it("treats the entire frame as the table region", async () => {
    const detector =
      new BasicTableDetector();

    const result =
      await detector.detect(
        createFrame()
      );

    expect(result.found)
      .toBe(true);

    expect(result.confidence)
      .toBe(1);

    expect(result.region)
      .toEqual({
        x: 0,
        y: 0,
        width: 1280,
        height: 720
      });
  });
});