import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  TableRegion
} from "./types.js";

import type {
  ImageDecoder
} from "../image/image-decoder.js";

export interface CroppedFrame {
  data: Uint8Array;
  width: number;
  height: number;
  channels: number;
}

export async function cropFrame(
  frame: VideoFrame,
  region: TableRegion,
  decoder: ImageDecoder
): Promise<CroppedFrame> {
  const image =
    await decoder.decode(
      frame.data
    );

  const x =
    Math.max(
      0,
      Math.min(
        Math.floor(region.x),
        image.width
      )
    );

  const y =
    Math.max(
      0,
      Math.min(
        Math.floor(region.y),
        image.height
      )
    );

  const right =
    Math.max(
      x,
      Math.min(
        Math.ceil(
          region.x + region.width
        ),
        image.width
      )
    );

  const bottom =
    Math.max(
      y,
      Math.min(
        Math.ceil(
          region.y + region.height
        ),
        image.height
      )
    );

  const width =
    right - x;

  const height =
    bottom - y;

  const data =
    new Uint8Array(
      width *
      height *
      image.channels
    );

  for (
    let row = 0;
    row < height;
    row += 1
  ) {
    const sourceStart =
      (
        (y + row) *
        image.width +
        x
      ) *
      image.channels;

    const sourceEnd =
      sourceStart +
      width *
      image.channels;

    const targetStart =
      row *
      width *
      image.channels;

    data.set(
      image.data.subarray(
        sourceStart,
        sourceEnd
      ),
      targetStart
    );
  }

  return {
    data,
    width,
    height,
    channels: image.channels
  };
}