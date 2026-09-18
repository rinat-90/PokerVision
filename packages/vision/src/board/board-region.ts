import type {
  Region
} from "../seat/seat-layout.js";

export function createBoardRegion(
  table: Region
): Region {
  const width =
    table.width * 0.5;

  const height =
    table.height * 0.45;

  return {
    x: Math.round(
      table.x +
      (
        table.width -
        width
      ) / 2
    ),
    y: Math.round(
      table.y +
      (
        table.height -
        height
      ) / 2
    ),
    width:
      Math.round(width),
    height:
      Math.round(height)
  };
}