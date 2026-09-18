import {
  FileVideoSource
} from "@poker-vision/video";

import type {
  VideoFrameRequest
} from "@poker-vision/video";

import type {
  FrameSource,
  SourceFrame
} from "./frame-source.js";

export interface VideoFrameSourceOptions {
  frameRequest?: VideoFrameRequest;
}

export class VideoFrameSource
  implements FrameSource {
  private readonly source: FileVideoSource;

  private readonly frameRequest:
    VideoFrameRequest | undefined;

  private running = false;

  constructor(
    filePath: string,
    options: VideoFrameSourceOptions = {}
  ) {
    this.source =
      new FileVideoSource(
        filePath
      );

    this.frameRequest =
      options.frameRequest;
  }

  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  async *[Symbol.asyncIterator]():
    AsyncIterator<SourceFrame> {
    if (!this.running) {
      return;
    }

    const frames =
      await this.source.getFrames(
        this.frameRequest
      );

    for (const frame of frames) {
      if (!this.running) {
        return;
      }

      yield {
        index: frame.index,
        width: frame.width,
        height: frame.height,
        timestampSeconds:
        frame.timestampSeconds,
        data: Buffer.from(
          frame.data
        )
      };
    }
  }
}