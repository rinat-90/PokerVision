import type {
  Region
} from "../seat/seat-layout.js";

export interface PlayerActionRegion
  extends Region {
  seatIndex: number;
}

export function createPlayerActionRegions(
  table: Region
): PlayerActionRegion[] {
  const regionWidth =
    table.width * 0.12;

  const regionHeight =
    table.height * 0.12;

  const centerX =
    table.x +
    table.width / 2;

  const centerY =
    table.y +
    table.height / 2;

  const horizontalOffset =
    table.width * 0.22;

  const verticalOffset =
    table.height * 0.34;

  const positions = [
    {
      seatIndex: 0,
      x: centerX,
      y:
        centerY -
        verticalOffset
    },
    {
      seatIndex: 1,
      x:
        centerX +
        horizontalOffset,
      y:
        centerY -
        verticalOffset * 0.55
    },
    {
      seatIndex: 2,
      x:
        centerX +
        horizontalOffset,
      y:
        centerY +
        verticalOffset * 0.55
    },
    {
      seatIndex: 3,
      x: centerX,
      y:
        centerY +
        verticalOffset
    },
    {
      seatIndex: 4,
      x:
        centerX -
        horizontalOffset,
      y:
        centerY +
        verticalOffset * 0.55
    },
    {
      seatIndex: 5,
      x:
        centerX -
        horizontalOffset,
      y:
        centerY -
        verticalOffset * 0.55
    }
  ];

  return positions.map(
    ({
       seatIndex,
       x,
       y
     }) => ({
      seatIndex,
      x: Math.round(
        x -
        regionWidth / 2
      ),
      y: Math.round(
        y -
        regionHeight / 2
      ),
      width:
        Math.round(
          regionWidth
        ),
      height:
        Math.round(
          regionHeight
        )
    })
  );
}