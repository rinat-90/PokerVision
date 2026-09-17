import type {
  VideoFrame,
  VideoFrameRequest
} from "@poker-vision/video";

import {
  extractFrames
} from "@poker-vision/video";

import type {
  TableDetection
} from "./types.js";

import type {
  TableDetector
} from "./table-detector.js";

export interface TableDetectionFrame {
  frame: VideoFrame;
  detection: TableDetection;
}

export interface TableDetectionPipelineOptions {
  frameRequest?: VideoFrameRequest;
}

export async function detectTablesInVideo(
  filePath: string,
  detector: TableDetector,
  options: TableDetectionPipelineOptions = {}
): Promise<TableDetectionFrame[]> {
  const frames =
    await extractFrames(
      filePath,
      options.frameRequest
    );

  const results: TableDetectionFrame[] = [];

  for (
    const frame of frames
    ) {
    const detection =
      await detector.detect(
        frame
      );

    results.push({
      frame,
      detection
    });
  }

  return results;
}