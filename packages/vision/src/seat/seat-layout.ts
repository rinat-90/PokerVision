export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SeatAnchor {
  index: number;
  x: number;
  y: number;
}

export function createSixMaxSeatAnchors(
  table: Region
): SeatAnchor[] {
  const centerX =
    table.x +
    table.width / 2;

  const centerY =
    table.y +
    table.height / 2;

  return [
    {
      index: 0,
      x: centerX,
      y: table.y
    },
    {
      index: 1,
      x:
        table.x +
        table.width,
      y:
        centerY -
        table.height * 0.25
    },
    {
      index: 2,
      x:
        table.x +
        table.width,
      y:
        centerY +
        table.height * 0.25
    },
    {
      index: 3,
      x: centerX,
      y:
        table.y +
        table.height
    },
    {
      index: 4,
      x: table.x,
      y:
        centerY +
        table.height * 0.25
    },
    {
      index: 5,
      x: table.x,
      y:
        centerY -
        table.height * 0.25
    }
  ];
}