import type {
  Region
} from "../seat/seat-layout.js";

export interface CardSymbolRegions {
  rank: Region;
  suit: Region;
}

export function createCardSymbolRegions(
  corner: Region
): CardSymbolRegions {
  const rankHeight =
    Math.round(
      corner.height * 0.4
    );

  const symbolWidth =
    Math.round(
      corner.width * 0.7
    );

  const horizontalInset =
    Math.round(
      (
        corner.width -
        symbolWidth
      ) / 2
    );

  const suitY =
    corner.y +
    rankHeight;

  const suitHeight =
    Math.round(
      corner.height * 0.4
    );

  return {
    rank: {
      x:
        corner.x +
        horizontalInset,
      y:
      corner.y,
      width:
      symbolWidth,
      height:
      rankHeight
    },

    suit: {
      x:
        corner.x +
        horizontalInset,
      y:
      suitY,
      width:
      symbolWidth,
      height:
      suitHeight
    }
  };
}