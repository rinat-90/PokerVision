import type {
  SymbolMask
} from "./symbol-mask.js";

import {
  findSymbolBounds
} from "./symbol-bounds.js";

export interface NormalizeSymbolMaskOptions {
  width?: number;
  height?: number;
  padding?: number;
}

export function normalizeSymbolMask(
  mask: SymbolMask,
  options:
  NormalizeSymbolMaskOptions = {}
): SymbolMask {
  const targetWidth =
    options.width ?? 24;

  const targetHeight =
    options.height ?? 24;

  const padding =
    options.padding ?? 2;

  const output: SymbolMask = {
    width:
    targetWidth,
    height:
    targetHeight,
    data:
      new Uint8Array(
        targetWidth *
        targetHeight
      )
  };

  const bounds =
    findSymbolBounds(
      mask
    );

  if (!bounds) {
    return output;
  }

  const availableWidth =
    Math.max(
      1,
      targetWidth -
      padding * 2
    );

  const availableHeight =
    Math.max(
      1,
      targetHeight -
      padding * 2
    );

  const scale =
    Math.min(
      availableWidth /
      bounds.width,
      availableHeight /
      bounds.height
    );

  const scaledWidth =
    Math.max(
      1,
      Math.round(
        bounds.width *
        scale
      )
    );

  const scaledHeight =
    Math.max(
      1,
      Math.round(
        bounds.height *
        scale
      )
    );

  const offsetX =
    Math.floor(
      (
        targetWidth -
        scaledWidth
      ) / 2
    );

  const offsetY =
    Math.floor(
      (
        targetHeight -
        scaledHeight
      ) / 2
    );

  for (
    let targetY = 0;
    targetY < scaledHeight;
    targetY += 1
  ) {
    for (
      let targetX = 0;
      targetX < scaledWidth;
      targetX += 1
    ) {
      const sourceX: number =
        bounds.x +
        Math.min(
          bounds.width - 1,
          Math.floor(
            targetX /
            scale
          )
        );

      const sourceY: number =
        bounds.y +
        Math.min(
          bounds.height - 1,
          Math.floor(
            targetY /
            scale
          )
        );

      const sourceIndex =
        sourceY *
        mask.width +
        sourceX;

      if (
        mask.data[
          sourceIndex
          ] !== 1
      ) {
        continue;
      }

      const outputX =
        offsetX +
        targetX;

      const outputY =
        offsetY +
        targetY;

      output.data[
      outputY *
      targetWidth +
      outputX
        ] = 1;
    }
  }

  return output;
}