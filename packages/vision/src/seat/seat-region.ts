import {
  createSixMaxSeatAnchors,
  type Region
} from "./seat-layout.js";

export interface SeatRegion
  extends Region {
  index: number;
}

export interface FrameBounds {
  width: number;
  height: number;
}

export function createSixMaxSeatRegions(
  table: Region,
  bounds: FrameBounds
): SeatRegion[] {
  const anchors =
    createSixMaxSeatAnchors(
      table
    );

  const sideWidth =
    table.width * 0.3;

  const sideHeight =
    table.height * 0.45;

  const centerWidth =
    table.width * 0.25;

  const centerHeight =
    table.height * 0.45;

  return anchors.map(
    (anchor) => {
      let rawX: number;
      let rawY: number;
      let width: number;
      let height: number;

      switch (
        anchor.index
        ) {
        /*
         * Top center.
         * Region extends upward
         * from the table.
         */
        case 0:
          width =
            centerWidth;

          height =
            centerHeight;

          rawX =
            anchor.x -
            width / 2;

          rawY =
            anchor.y -
            height;

          break;

        /*
         * Top right.
         * Region extends outward
         * and upward.
         */
        case 1:
          width =
            sideWidth;

          height =
            sideHeight;

          rawX =
            anchor.x -
            width / 2;

          rawY =
            anchor.y -
            height;

          break;

        /*
         * Bottom right.
         * Region extends outward
         * and slightly upward so
         * hole cards stay included.
         */
        case 2:
          width =
            sideWidth;

          height =
            sideHeight;

          rawX =
            anchor.x -
            width / 2;

          rawY =
            anchor.y -
            height / 2;

          break;

        /*
         * Bottom center.
         * Region extends downward
         * from the table.
         */
        case 3:
          width =
            centerWidth;

          height =
            centerHeight;

          rawX =
            anchor.x -
            width / 2;

          rawY =
            anchor.y;

          break;

        /*
         * Bottom left.
         */
        case 4:
          width =
            sideWidth;

          height =
            sideHeight;

          rawX =
            anchor.x -
            width / 2;

          rawY =
            anchor.y -
            height / 2;

          break;

        /*
         * Top left.
         */
        case 5:
          width =
            sideWidth;

          height =
            sideHeight;

          rawX =
            anchor.x -
            width / 2;

          rawY =
            anchor.y -
            height;

          break;

        default:
          throw new Error(
            `Unsupported seat index: ${anchor.index}`
          );
      }

      const x =
        Math.max(
          0,
          rawX
        );

      const y =
        Math.max(
          0,
          rawY
        );

      const right =
        Math.min(
          bounds.width,
          rawX +
          width
        );

      const bottom =
        Math.min(
          bounds.height,
          rawY +
          height
        );

      return {
        index:
        anchor.index,
        x:
          Math.round(x),
        y:
          Math.round(y),
        width:
          Math.round(
            right - x
          ),
        height:
          Math.round(
            bottom - y
          )
      };
    }
  );
}