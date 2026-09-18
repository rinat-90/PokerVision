import type {
  SeatRegion
} from "../seat/seat-region.js";

export interface PlayerActionLabelRegion {
  seatIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createPlayerActionLabelRegions(
  seatRegions: SeatRegion[]
): PlayerActionLabelRegion[] {
  return seatRegions.map(
    seat => {
      const width =
        Math.round(
          seat.width * 0.42
        );

      const height =
        Math.round(
          seat.height * 0.22
        );

      let horizontalPosition = 0.5;

      /*
       * Side seats have their action label
       * below the stack box, toward the
       * center of the table.
       */
      if (
        seat.index === 4 ||
        seat.index === 5
      ) {
        horizontalPosition = 0.72;
      }

      if (
        seat.index === 1 ||
        seat.index === 2
      ) {
        horizontalPosition = 0.28;
      }

      const x =
        Math.round(
          seat.x +
          seat.width *
          horizontalPosition -
          width / 2
        );

      const isTopSeat =
        seat.index === 0 ||
        seat.index === 1 ||
        seat.index === 5;

      const isSideSeat =
        seat.index === 1 ||
        seat.index === 2 ||
        seat.index === 4 ||
        seat.index === 5;

      const y =
        isSideSeat
          ? Math.round(
            seat.y +
            seat.height * 0.86
          )
          : isTopSeat
            ? Math.round(
              seat.y +
              seat.height * 0.58
            )
            : Math.round(
              seat.y +
              seat.height * 0.62
            );

      return {
        seatIndex:
        seat.index,

        x,
        y,
        width,
        height
      };
    }
  );
}