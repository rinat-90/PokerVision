import type {
  BetChipComponent
} from "./bet-chip-detector.js";

export interface BetChipComponentSelectorInput {
  components: BetChipComponent[];
  seatIndex: number;
  frameWidth: number;
  frameHeight: number;
}

export interface BetChipComponentSelectorOptions {
  minimumPixelCount?: number;
  edgeMargin?: number;
}

export class BetChipComponentSelector {
  private readonly minimumPixelCount:
    number;

  private readonly edgeMargin:
    number;

  constructor(
    options:
    BetChipComponentSelectorOptions = {}
  ) {
    this.minimumPixelCount =
      options.minimumPixelCount ??
      4;

    this.edgeMargin =
      options.edgeMargin ??
      2;
  }

  select(
    input: BetChipComponentSelectorInput
  ): BetChipComponent | null {
    const {
      components,
      seatIndex,
      frameWidth,
      frameHeight
    } = input;

    const candidates =
      components.filter(
        component =>
          component.pixelCount >=
          this.minimumPixelCount &&
          !this.touchesEdge(
            component,
            frameWidth,
            frameHeight
          )
      );

    if (
      candidates.length === 0
    ) {
      return null;
    }

    const target =
      this.getTargetPoint(
        seatIndex,
        frameWidth,
        frameHeight
      );

    let selected:
      BetChipComponent | null = null;

    let selectedDistance =
      Number.POSITIVE_INFINITY;

    for (
      const component
      of candidates
      ) {
      const centerX =
        component.region.x +
        component.region.width / 2;

      const centerY =
        component.region.y +
        component.region.height / 2;

      const deltaX =
        centerX -
        target.x;

      const deltaY =
        centerY -
        target.y;

      const distance =
        deltaX * deltaX +
        deltaY * deltaY;

      if (
        distance <
        selectedDistance
      ) {
        selected =
          component;

        selectedDistance =
          distance;
      }
    }

    return selected;
  }

  private touchesEdge(
    component: BetChipComponent,
    frameWidth: number,
    frameHeight: number
  ): boolean {
    const {
      x,
      y,
      width,
      height
    } = component.region;

    const right =
      x + width;

    const bottom =
      y + height;

    return (
      x <= this.edgeMargin ||
      y <= this.edgeMargin ||
      right >=
      frameWidth -
      this.edgeMargin ||
      bottom >=
      frameHeight -
      this.edgeMargin
    );
  }

  private getTargetPoint(
    seatIndex: number,
    frameWidth: number,
    frameHeight: number
  ): {
    x: number;
    y: number;
  } {
    switch (seatIndex) {
      case 0:
        return {
          x:
            frameWidth / 2,
          y:
          frameHeight
        };

      case 1:
        return {
          x: 0,
          y:
          frameHeight
        };

      case 2:
        return {
          x: 0,
          y: 0
        };

      case 3:
        return {
          x:
            frameWidth / 2,
          y: 0
        };

      case 4:
        return {
          x:
          frameWidth,
          y: 0
        };

      case 5:
        return {
          x:
          frameWidth,
          y:
          frameHeight
        };

      default:
        return {
          x:
            frameWidth / 2,
          y:
            frameHeight / 2
        };
    }
  }
}