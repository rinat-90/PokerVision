import type {
  CroppedFrame
} from "../table/crop-frame.js";

export interface BetChipDetection {
  present: boolean;
  matchingPixelRatio: number;
}

export interface BetChipDetectorOptions {
  minimumBlueRatio?: number;
  minimumPixelRatio?: number;
}

export class BetChipDetector {
  private readonly minimumBlueRatio: number;

  private readonly minimumPixelRatio: number;

  constructor(
    options: BetChipDetectorOptions = {}
  ) {
    this.minimumBlueRatio =
      options.minimumBlueRatio ??
      1.25;

    this.minimumPixelRatio =
      options.minimumPixelRatio ??
      0.005;
  }

  detect(
    frame: CroppedFrame
  ): BetChipDetection {
    const {
      data,
      channels
    } = frame;

    let matchingPixels = 0;
    let pixelCount = 0;

    for (
      let index = 0;
      index + 2 < data.length;
      index += channels
    ) {
      const red =
        data[index] ?? 0;

      const green =
        data[index + 1] ?? 0;

      const blue =
        data[index + 2] ?? 0;

      pixelCount += 1;

      const blueDominatesRed =
        blue >
        red *
        this.minimumBlueRatio;

      const blueDominatesGreen =
        blue >
        green *
        1.05;

      const sufficientlyBlue =
        blue >= 120;

      if (
        blueDominatesRed &&
        blueDominatesGreen &&
        sufficientlyBlue
      ) {
        matchingPixels += 1;
      }
    }

    const matchingPixelRatio =
      pixelCount === 0
        ? 0
        : matchingPixels /
        pixelCount;

    return {
      present:
        matchingPixelRatio >=
        this.minimumPixelRatio,
      matchingPixelRatio
    };
  }
}