import type {
  BetChipRegion
} from "./bet-chip-detector.js";

import type {
  PlayerActionRegion
} from "./player-action-region.js";

import type {
  BetAmountRegion
} from "./bet-amount-region.js";

export interface BetAmountChipRegionOptions {
  horizontalPadding?: number;
  verticalPadding?: number;
  widthMultiplier?: number;
  heightMultiplier?: number;
}

export function createBetAmountRegionFromChip(
  chipRegion: BetChipRegion,
  actionRegion: PlayerActionRegion,
  frameWidth: number,
  frameHeight: number,
  options:
  BetAmountChipRegionOptions = {}
): BetAmountRegion {
  const horizontalPadding =
    options.horizontalPadding ??
    6;

  const verticalPadding =
    options.verticalPadding ??
    4;

  const widthMultiplier =
    options.widthMultiplier ??
    3;

  const heightMultiplier =
    options.heightMultiplier ??
    1.8;

  const chipGlobalX =
    actionRegion.x +
    chipRegion.x;

  const chipGlobalY =
    actionRegion.y +
    chipRegion.y;

  const chipCenterX =
    chipGlobalX +
    chipRegion.width / 2;

  const chipCenterY =
    chipGlobalY +
    chipRegion.height / 2;

  const desiredWidth =
    Math.max(
      chipRegion.width,
      Math.round(
        chipRegion.width *
        widthMultiplier
      )
    );

  const desiredHeight =
    Math.max(
      chipRegion.height,
      Math.round(
        chipRegion.height *
        heightMultiplier
      )
    );

  /*
   * Keep the selected chip inside the ROI while
   * giving OCR room for the amount rendered next
   * to it.
   *
   * The region is intentionally derived from the
   * detected chip instead of the player stack/UI.
   */
  const desiredX =
    Math.round(
      chipCenterX -
      desiredWidth / 2 -
      horizontalPadding
    );

  const desiredY =
    Math.round(
      chipCenterY -
      desiredHeight / 2 -
      verticalPadding
    );

  const x =
    Math.max(
      0,
      desiredX
    );

  const y =
    Math.max(
      0,
      desiredY
    );

  const right =
    Math.min(
      frameWidth,
      desiredX +
      desiredWidth +
      horizontalPadding * 2
    );

  const bottom =
    Math.min(
      frameHeight,
      desiredY +
      desiredHeight +
      verticalPadding * 2
    );

  return {
    seatIndex:
    actionRegion.seatIndex,

    x,

    y,

    width:
      Math.max(
        1,
        right - x
      ),

    height:
      Math.max(
        1,
        bottom - y
      )
  };
}