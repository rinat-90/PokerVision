import sharp from "sharp";

export interface BetAmountOcrPreprocessorOptions {
  scale?: number;
  threshold?: number;
}

export class BetAmountOcrPreprocessor {
  private readonly scale: number;
  private readonly threshold: number;

  constructor(
    options: BetAmountOcrPreprocessorOptions = {}
  ) {
    this.scale =
      options.scale ?? 4;

    this.threshold =
      options.threshold ?? 180;
  }

  async preprocess(
    frame: {
      width: number;
      height: number;
      data: Uint8Array;
      channels: number;
    }
  ): Promise<Buffer> {
    if (
      frame.width <= 0 ||
      frame.height <= 0
    ) {
      throw new Error(
        "Expected non-empty image dimensions"
      );
    }

    if (
      frame.channels !== 3 &&
      frame.channels !== 4
    ) {
      throw new Error(
        "Expected RGB/RGBA image data"
      );
    }

    const expectedLength =
      frame.width *
      frame.height *
      frame.channels;

    if (
      frame.data.length !==
      expectedLength
    ) {
      throw new Error(
        "Image data length does not match dimensions"
      );
    }

    return sharp(
      Buffer.from(
        frame.data
      ),
      {
        raw: {
          width:
          frame.width,
          height:
          frame.height,
          channels:
          frame.channels
        }
      }
    )
      .greyscale()
      .resize({
        width:
          frame.width *
          this.scale,
        height:
          frame.height *
          this.scale,
        kernel: "nearest"
      })
      .normalize()
      .threshold(
        this.threshold
      )
      .png()
      .withMetadata({
        density: 300
      })
      .toBuffer();
  }
}