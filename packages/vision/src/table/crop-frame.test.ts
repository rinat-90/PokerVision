import { describe, expect, it } from "vitest";

import type {
  VideoFrame
} from "@poker-vision/video";

import {
  cropFrame
} from "./crop-frame.js";

function createFrame(): VideoFrame {
  return {
    index: 0,
    timestampSeconds: 0,
    data: new Uint8Array([1, 2, 3]),
    width: 1280,
    height: 720
  };
}

describe("cropFrame", () => {
  it("returns the requested region dimensions", () => {
    const result =
      cropFrame(
        createFrame(),
        {
          x: 100,
          y: 50,
          width: 800,
          height: 400
        }
      );

    expect(result.width)
      .toBe(800);

    expect(result.height)
      .toBe(400);

    expect(result.data)
      .toBeInstanceOf(Uint8Array);
  });

  it("clamps a region that extends beyond the frame", () => {
    const result =
      cropFrame(
        createFrame(),
        {
          x: 1000,
          y: 600,
          width: 500,
          height: 300
        }
      );

    expect(result.width)
      .toBe(280);

    expect(result.height)
      .toBe(120);
  });

  it("clamps negative coordinates", () => {
    const result =
      cropFrame(
        createFrame(),
        {
          x: -100,
          y: -50,
          width: 500,
          height: 300
        }
      );

    expect(result.width)
      .toBe(400);

    expect(result.height)
      .toBe(250);
  });

  it("handles a region larger than the entire frame", () => {
    const result =
      cropFrame(
        createFrame(),
        {
          x: -100,
          y: -100,
          width: 2000,
          height: 2000
        }
      );

    expect(result.width)
      .toBe(1280);

    expect(result.height)
      .toBe(720);
  });
});