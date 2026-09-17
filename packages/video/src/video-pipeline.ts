import type {
  VideoFrame,
  VideoFrameRequest,
  VideoMetadata
} from "./types.js";

import {
  probeVideo
} from "./video-probe.js";

import {
  extractFrames
} from "./frame-extractor.js";

import {
  validateVideo,
  type VideoValidationOptions
} from "./video-validator.js";

export interface VideoPipelineOptions
  extends VideoValidationOptions {
  frameRequest?: VideoFrameRequest;
}

export interface VideoPipelineResult {
  metadata: VideoMetadata;
  frames: VideoFrame[];
}

export async function processVideo(
  filePath: string,
  options: VideoPipelineOptions = {}
): Promise<VideoPipelineResult> {
  const metadata =
    await probeVideo(filePath);

  const validation =
    validateVideo(
      metadata,
      options
    );

  if (!validation.valid) {
    throw new Error(
      `Video validation failed:\n` +
      validation.errors
        .map(
          (error) => `- ${error}`
        )
        .join("\n")
    );
  }

  const frames =
    await extractFrames(
      filePath,
      options.frameRequest
    );

  return {
    metadata,
    frames
  };
}