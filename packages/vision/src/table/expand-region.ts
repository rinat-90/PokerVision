export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RegionPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function expandRegion(
  region: Region,
  padding: RegionPadding,
  bounds: {
    width: number;
    height: number;
  }
): Region {
  const x =
    Math.max(
      0,
      region.x -
      padding.left
    );

  const y =
    Math.max(
      0,
      region.y -
      padding.top
    );

  const right =
    Math.min(
      bounds.width,
      region.x +
      region.width +
      padding.right
    );

  const bottom =
    Math.min(
      bounds.height,
      region.y +
      region.height +
      padding.bottom
    );

  return {
    x,
    y,
    width:
      right - x,
    height:
      bottom - y
  };
}