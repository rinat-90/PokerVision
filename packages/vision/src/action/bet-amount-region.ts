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

      return {
        seatIndex:
        region.seatIndex,

        /*
         * Bet amounts are rendered inside the
         * player action region next to the chip.
         *
         * Inset the region horizontally to reduce
         * chip/table-edge noise while preserving
         * amounts such as:
         *
         * 100
         * 200
         * 600
         * 1,900
         * 5,700
         */
        x:
          region.x +
          horizontalInset,

        y:
          region.y +
          verticalInset,

        width:
          region.width -
          horizontalInset * 2,

        height:
          region.height -
          verticalInset * 2
      };
    }
  );
}