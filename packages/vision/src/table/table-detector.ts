import type {
  TableDetection
} from "./types.js";

import type {
  VideoFrame
} from "@poker-vision/video";

export interface TableDetector {
  detect(
    frame: VideoFrame
  ): Promise<TableDetection>;
}