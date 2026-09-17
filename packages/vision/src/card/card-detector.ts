import type {
  CroppedFrame
} from "../table/crop-frame.js";

import type {
  CardDetection
} from "./types.js";

export interface CardDetector {
  detect(
    frame: CroppedFrame
  ): Promise<CardDetection>;
}