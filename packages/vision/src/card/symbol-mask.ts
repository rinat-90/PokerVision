import type {
  CroppedFrame
} from "../table/crop-frame.js";

export interface SymbolMask {
  width: number;
  height: number;
  data: Uint8Array;
}

export interface SymbolMaskOptions {
  brightnessThreshold?: number;
}

export function createSymbolMask(
  frame: CroppedFrame,
  options:
  SymbolMaskOptions = {}
): SymbolMask {
  const brightnessThreshold =
    options.brightnessThreshold ??
    0.8;

  const data =
    new Uint8Array(
      frame.width *
      frame.height
    );

  for (
    let y = 0;
    y < frame.height;
    y += 1
  ) {
    for (
      let x = 0;
      x < frame.width;
      x += 1
    ) {
      const sourceOffset =
        (
          y *
          frame.width +
          x
        ) *
        frame.channels;

      const targetOffset =
        y *
        frame.width +
        x;

      const r =
        (
          frame.data[
            sourceOffset
            ] ?? 0
        ) / 255;

      const g =
        (
          frame.data[
          sourceOffset + 1
            ] ?? 0
        ) / 255;

      const b =
        (
          frame.data[
          sourceOffset + 2
            ] ?? 0
        ) / 255;

      const brightness =
        (
          r +
          g +
          b
        ) / 3;

      data[targetOffset] =
        brightness <
        brightnessThreshold
          ? 1
          : 0;
    }
  }

  return {
    width:
    frame.width,
    height:
    frame.height,
    data
  };
}