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
    (region) => ({
      seatIndex:
      region.seatIndex,

      /*
       * Bet amounts are rendered below the
       * player action region on the table.
       *
       * Keep the region wide enough to support
       * amounts such as:
       *
       * 100
       * 600
       * 1,900
       * 5,700
       */
      x:
        region.x -
        Math.round(
          region.width * 0.15
        ),

      y:
        region.y +
        Math.round(
          region.height * 0.8
        ),

      width:
        Math.round(
          region.width * 1.3
        ),

      height:
        Math.round(
          region.height * 0.9
        )
    })
  );
}