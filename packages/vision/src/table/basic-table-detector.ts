import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  TableDetection
} from "./types.js";

import type {
  TableDetector
} from "./table-detector.js";

export class BasicTableDetector
  implements TableDetector
{
  async detect(
    frame: VideoFrame
  ): Promise<TableDetection> {
    return {
      found: true,
      confidence: 1,
      region: {
        x: 0,
        y: 0,
        width: frame.width,
        height: frame.height
      }
    };
  }
}