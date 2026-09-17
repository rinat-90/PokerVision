import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  TableRegion
} from "./types.js";

export interface CroppedFrame {
  data: Uint8Array;
  width: number;
  height: number;
}

export function cropFrame(
  frame: VideoFrame,
  region: TableRegion
): CroppedFrame {
  const x = Math.max(
    0,
    Math.min(
      Math.floor(region.x),
      frame.width
    )
  );

  const y = Math.max(
    0,
    Math.min(
      Math.floor(region.y),
      frame.height
    )
  );

  const right = Math.max(
    x,
    Math.min(
      Math.ceil(region.x + region.width),
      frame.width
    )
  );

  const bottom = Math.max(
    y,
    Math.min(
      Math.ceil(region.y + region.height),
      frame.height
    )
  );

  return {
    data: frame.data,
    width: right - x,
    height: bottom - y
  };
}