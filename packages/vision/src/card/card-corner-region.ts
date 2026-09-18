import type {
  Region
} from "../seat/seat-layout.js";

export function createCardCornerRegion(
  card: Region
): Region {
  const width =
    card.width * 0.4;

  const height =
    card.height * 0.55;

  return {
    x:
    card.x,
    y:
    card.y,
    width:
      Math.round(width),
    height:
      Math.round(height)
  };
}