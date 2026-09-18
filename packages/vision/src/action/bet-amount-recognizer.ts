export interface BetAmountRecognition {
  seatIndex: number;
  hasText: boolean;
  confidence: number;
  matchingPixelRatio: number;
}

export interface BetAmountRecognizerOptions {
  brightnessThreshold?: number;
  minimumPixelRatio?: number;
}

export class BetAmountRecognizer {
  private readonly brightnessThreshold: number;
  private readonly minimumPixelRatio: number;

  constructor(
    options: BetAmountRecognizerOptions = {}
  ) {
    this.brightnessThreshold =
      options.brightnessThreshold ?? 0.75;

    this.minimumPixelRatio =
      options.minimumPixelRatio ?? 0.01;
  }

  recognize(
    frame: {
      width: number;
      height: number;
      data: Uint8Array;
    },
    seatIndex: number
  ): BetAmountRecognition {
    const channels =
      frame.data.length /
      (frame.width * frame.height);

    if (
      !Number.isInteger(channels) ||
      channels < 3
    ) {
      throw new Error(
        "Expected RGB/RGBA image data"
      );
    }

    let matchingPixels = 0;

    const pixelCount =
      frame.width *
      frame.height;

    for (
      let index = 0;
      index < pixelCount;
      index++
    ) {
      const offset =
        index * channels;

      const r =
        frame.data[offset] ?? 0;

      const g =
        frame.data[offset + 1] ?? 0;

      const b =
        frame.data[offset + 2] ?? 0;

      const brightness =
        (
          r +
          g +
          b
        ) /
        (255 * 3);

      if (
        brightness >=
        this.brightnessThreshold
      ) {
        matchingPixels++;
      }
    }

    const matchingPixelRatio =
      pixelCount === 0
        ? 0
        : matchingPixels /
        pixelCount;

    const hasText =
      matchingPixelRatio >=
      this.minimumPixelRatio;

    return {
      seatIndex,
      hasText,
      matchingPixelRatio,
      confidence: Math.min(
        1,
        matchingPixelRatio /
        0.1
      )
    };
  }
}