import type {
  PlayerActionRegion
} from "./player-action-region.js";

export interface BetAmountRegion {
  seatIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function createBetAmountRegions(
  actionRegions: PlayerActionRegion[]
): BetAmountRegion[] {
  return actionRegions.map(
    (region) => {
      const horizontalInset =
        Math.round(
          region.width * 0.15
        );

      const verticalInset =
        Math.round(
          region.height * 0.1
        );

      const isUpperSideSeat =
        region.seatIndex === 1 ||
        region.seatIndex === 5;

      /*
       * Most bet amounts are rendered inside
       * the player action region next to the chip.
       *
       * For the upper side seats (S1/S5), the
       * amount is positioned higher and can extend
       * above the normal action region.
       */
      const y =
        isUpperSideSeat
          ? region.y -
          Math.round(
            region.height * 0.5
          )
          : region.y +
          verticalInset;

      const height =
        isUpperSideSeat
          ? region.height +
          Math.round(
            region.height * 0.5
          )
          : region.height -
          verticalInset * 2;

      return {
        seatIndex:
        region.seatIndex,

        x:
          region.x +
          horizontalInset,

        y,

        width:
          region.width -
          horizontalInset * 2,

        height
      };
    }
  );
}