import type {
  CroppedFrame
} from "../table/crop-frame.js";

export type PlayerActionLabel =
  | "check"
  | "call"
  | "fold"
  | "placeBet";

export interface PlayerActionLabelDetection {
  label: PlayerActionLabel | null;

  matchingPixelRatio: number;

  greenPixelRatio: number;

  orangePixelRatio: number;

  redPixelRatio: number;
}

export interface PlayerActionLabelDetectorOptions {
  minimumPixelRatio?: number;
}

export class PlayerActionLabelDetector {
  private readonly minimumPixelRatio: number;

  constructor(
    options: PlayerActionLabelDetectorOptions = {}
  ) {
    this.minimumPixelRatio =
      options.minimumPixelRatio ?? 0.002;
  }

  detect(
    frame: CroppedFrame
  ): PlayerActionLabelDetection {
    const {
      data,
      channels
    } = frame;

    let greenPixels = 0;
    let orangePixels = 0;
    let redPixels = 0;
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

      if (
        green >= 120 &&
        green > red * 1.35 &&
        green > blue * 1.35
      ) {
        greenPixels += 1;
      }

      if (
        red >= 120 &&
        green >= 60 &&
        red > blue * 1.5 &&
        green > blue * 1.2
      ) {
        orangePixels += 1;
      }

      if (
        red >= 120 &&
        red > green * 1.5 &&
        red > blue * 1.5
      ) {
        redPixels += 1;
      }
    }

    if (pixelCount === 0) {
      return {
        label: null,
        matchingPixelRatio: 0,
        greenPixelRatio: 0,
        orangePixelRatio: 0,
        redPixelRatio: 0
      };
    }

    const greenPixelRatio =
      greenPixels /
      pixelCount;

    const orangePixelRatio =
      orangePixels /
      pixelCount;

    const redPixelRatio =
      redPixels /
      pixelCount;

    /*
     * Place Bet is strongly green in the
     * observed UI.
     *
     * Require green to dominate both other
     * color classes so background colors do
     * not produce a false action.
     */
    const greenDominant =
      greenPixelRatio >=
      this.minimumPixelRatio &&
      greenPixelRatio >
      orangePixelRatio * 1.25 &&
      greenPixelRatio >
      redPixelRatio * 1.25;

    if (greenDominant) {
      return {
        label: "placeBet",

        matchingPixelRatio:
        greenPixelRatio,

        greenPixelRatio,
        orangePixelRatio,
        redPixelRatio
      };
    }

    /*
     * Fold is cleanly red in the fixture.
     *
     * Do not classify orange/yellow labels
     * as Fold merely because their red
     * channel also passes the red threshold.
     */
    const redDominant =
      redPixelRatio >=
      this.minimumPixelRatio &&
      redPixelRatio >
      orangePixelRatio * 1.25 &&
      redPixelRatio >
      greenPixelRatio * 1.25;

    if (redDominant) {
      return {
        label: "fold",

        matchingPixelRatio:
        redPixelRatio,

        greenPixelRatio,
        orangePixelRatio,
        redPixelRatio
      };
    }

    /*
     * Check and Call are both orange/yellow.
     * Color confirms an action label exists,
     * but text recognition must distinguish
     * the semantic action.
     */
    const orangeDominant =
      orangePixelRatio >=
      this.minimumPixelRatio &&
      orangePixelRatio >
      greenPixelRatio &&
      orangePixelRatio >
      redPixelRatio;

    if (orangeDominant) {
      return {
        label: null,

        matchingPixelRatio:
        orangePixelRatio,

        greenPixelRatio,
        orangePixelRatio,
        redPixelRatio
      };
    }

    return {
      label: null,

      matchingPixelRatio: 0,

      greenPixelRatio,
      orangePixelRatio,
      redPixelRatio
    };
  }
}