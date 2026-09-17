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

export interface VideoSource {
  getMetadata(): Promise<VideoMetadata>;

  getFrames(
    request?: VideoFrameRequest
  ): Promise<VideoFrame[]>;
}

export class FileVideoSource
  implements VideoSource
{
  constructor(
    private readonly filePath: string
  ) {}

  async getMetadata(): Promise<VideoMetadata> {
    return probeVideo(this.filePath);
  }

  async getFrames(
    request: VideoFrameRequest = {}
  ): Promise<VideoFrame[]> {
    return extractFrames(
      this.filePath,
      request
    );
  }
}