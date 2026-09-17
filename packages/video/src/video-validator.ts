import type { VideoMetadata } from "./types.js";

export interface VideoValidationOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxDurationSeconds?: number;
  minFps?: number;
  maxFps?: number;
}

export interface VideoValidationResult {
  valid: boolean;
  errors: string[];
}

const DEFAULT_OPTIONS: Required<
  VideoValidationOptions
> = {
  maxWidth: 7680,
  maxHeight: 4320,
  maxDurationSeconds: 4 * 60 * 60,
  minFps: 1,
  maxFps: 240
};

export function validateVideo(
  metadata: VideoMetadata,
  options: VideoValidationOptions = {}
): VideoValidationResult {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  const errors: string[] = [];

  if (metadata.width <= 0) {
    errors.push(
      "Video width must be greater than 0"
    );
  }

  if (metadata.height <= 0) {
    errors.push(
      "Video height must be greater than 0"
    );
  }

  if (metadata.width > config.maxWidth) {
    errors.push(
      `Video width exceeds maximum of ${config.maxWidth}`
    );
  }

  if (metadata.height > config.maxHeight) {
    errors.push(
      `Video height exceeds maximum of ${config.maxHeight}`
    );
  }

  if (metadata.fps < config.minFps) {
    errors.push(
      `Video FPS is below minimum of ${config.minFps}`
    );
  }

  if (metadata.fps > config.maxFps) {
    errors.push(
      `Video FPS exceeds maximum of ${config.maxFps}`
    );
  }

  if (metadata.durationSeconds <= 0) {
    errors.push(
      "Video duration must be greater than 0"
    );
  }

  if (
    metadata.durationSeconds >
    config.maxDurationSeconds
  ) {
    errors.push(
      `Video duration exceeds maximum of ` +
      `${config.maxDurationSeconds} seconds`
    );
  }

  if (metadata.frameCount <= 0) {
    errors.push(
      "Video must contain at least one frame"
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}