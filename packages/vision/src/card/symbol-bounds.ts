import type {
  SymbolMask
} from "./symbol-mask.js";

export interface SymbolBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function findSymbolBounds(
  mask: SymbolMask
): SymbolBounds | null {
  let minX =
    mask.width;

  let minY =
    mask.height;

  let maxX = -1;
  let maxY = -1;

  for (
    let y = 0;
    y < mask.height;
    y += 1
  ) {
    for (
      let x = 0;
      x < mask.width;
      x += 1
    ) {
      const index =
        y *
        mask.width +
        x;

      if (
        mask.data[index] !== 1
      ) {
        continue;
      }

      minX =
        Math.min(
          minX,
          x
        );

      minY =
        Math.min(
          minY,
          y
        );

      maxX =
        Math.max(
          maxX,
          x
        );

      maxY =
        Math.max(
          maxY,
          y
        );
    }
  }

  if (
    maxX === -1 ||
    maxY === -1
  ) {
    return null;
  }

  return {
    x:
    minX,
    y:
    minY,
    width:
      maxX -
      minX +
      1,
    height:
      maxY -
      minY +
      1
  };
}