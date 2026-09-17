import { describe, expect, it } from "vitest";

import {
  validateVideo
} from "./video-validator.js";

const validMetadata = {
  width: 1280,
  height: 720,
  fps: 30,
  durationSeconds: 120,
  frameCount: 3600,
  codec: "h264",
  format: "mov,mp4,m4a,3gp,3g2,mj2"
};

describe("validateVideo", () => {
  it("accepts valid video metadata", () => {
    const result =
      validateVideo(validMetadata);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("rejects invalid dimensions", () => {
    const result =
      validateVideo({
        ...validMetadata,
        width: 0
      });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Video width must be greater than 0"
    );
  });

  it("rejects video above maximum resolution", () => {
    const result =
      validateVideo(
        {
          ...validMetadata,
          width: 8000
        },
        {
          maxWidth: 7680
        }
      );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Video width exceeds maximum of 7680"
    );
  });

  it("rejects FPS outside allowed range", () => {
    const result =
      validateVideo(
        {
          ...validMetadata,
          fps: 0
        },
        {
          minFps: 1
        }
      );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Video FPS is below minimum of 1"
    );
  });

  it("rejects video that is too long", () => {
    const result =
      validateVideo(
        {
          ...validMetadata,
          durationSeconds: 500
        },
        {
          maxDurationSeconds: 300
        }
      );

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Video duration exceeds maximum of 300 seconds"
    );
  });

  it("reports multiple validation errors", () => {
    const result =
      validateVideo({
        ...validMetadata,
        width: 0,
        height: 0,
        fps: 0,
        durationSeconds: 0,
        frameCount: 0
      });

    expect(result.valid).toBe(false);
    expect(result.errors.length)
      .toBeGreaterThanOrEqual(4);
  });
});