import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  TableDetection,
  TableRegion
} from "./types.js";

import type {
  TableDetector
} from "./table-detector.js";

import type {
  ImageDecoder
} from "../image/image-decoder.js";

export interface PurpleTableDetectorOptions {
  minSaturation?: number;
  minBrightness?: number;
  minPixelRatio?: number;
  rowSegments?: number;
}

export class PurpleTableDetector
  implements TableDetector
{
  private readonly minSaturation: number;
  private readonly minBrightness: number;
  private readonly minPixelRatio: number;
  private readonly rowSegments: number;

  constructor(
    private readonly decoder: ImageDecoder,
    options: PurpleTableDetectorOptions = {}
  ) {
    this.minSaturation =
      options.minSaturation ?? 0.2;

    this.minBrightness =
      options.minBrightness ?? 0.15;

    this.minPixelRatio =
      options.minPixelRatio ?? 0.05;

    this.rowSegments =
      options.rowSegments ?? 20;
  }

  async detect(
    frame: VideoFrame
  ): Promise<TableDetection> {
    const image =
      await this.decoder.decode(frame.data);

    if (image.channels < 3) {
      return {
        found: false,
        confidence: 0
      };
    }

    const rowRatios =
      this.calculateRowPurpleRatios(image);

    const peakRowRatio =
      Math.max(...rowRatios);

    if (
      peakRowRatio < this.minPixelRatio
    ) {
      return {
        found: false,
        confidence: 0
      };
    }

    const rowThreshold =
      peakRowRatio * 0.35;

    let firstRow = -1;
    let lastRow = -1;

    for (
      let index = 0;
      index < rowRatios.length;
      index += 1
    ) {
      const ratio =
        rowRatios[index] ?? 0;

      if (
        ratio >= rowThreshold
      ) {
        if (firstRow === -1) {
          firstRow = index;
        }

        lastRow = index;
      }
    }

    if (
      firstRow === -1 ||
      lastRow === -1
    ) {
      return {
        found: false,
        confidence: 0
      };
    }

    const segmentHeight =
      image.height / this.rowSegments;

    const startY =
      Math.floor(
        firstRow * segmentHeight
      );

    const endY =
      Math.ceil(
        (lastRow + 1) * segmentHeight
      );

    const columnRatios =
      this.calculateColumnPurpleRatios(
        image,
        startY,
        endY
      );

    const peakColumnRatio =
      Math.max(...columnRatios);

    const columnThreshold =
      peakColumnRatio * 0.35;

    let firstColumn = -1;
    let lastColumn = -1;

    for (
      let index = 0;
      index < columnRatios.length;
      index += 1
    ) {
      const ratio =
        columnRatios[index] ?? 0;

      if (
        ratio >= columnThreshold
      ) {
        if (firstColumn === -1) {
          firstColumn = index;
        }

        lastColumn = index;
      }
    }

    if (
      firstColumn === -1 ||
      lastColumn === -1
    ) {
      return {
        found: false,
        confidence: 0
      };
    }

    const segmentWidth =
      image.width / columnRatios.length;

    const x =
      Math.floor(
        firstColumn * segmentWidth
      );

    const right =
      Math.ceil(
        (lastColumn + 1) *
        segmentWidth
      );

    const region: TableRegion = {
      x,
      y: startY,
      width: right - x,
      height: endY - startY
    };

    const confidence =
      Math.min(
        1,
        Math.min(
          peakRowRatio,
          peakColumnRatio
        ) / 0.8
      );

    return {
      found: true,
      confidence,
      region
    };
  }

  private calculateRowPurpleRatios(
    image: {
      width: number;
      height: number;
      channels: number;
      data: Uint8Array;
    }
  ): number[] {
    const ratios: number[] = [];

    const segmentHeight =
      Math.ceil(
        image.height / this.rowSegments
      );

    for (
      let segment = 0;
      segment < this.rowSegments;
      segment += 1
    ) {
      const startY =
        segment * segmentHeight;

      const endY =
        Math.min(
          image.height,
          startY + segmentHeight
        );

      let purplePixels = 0;
      let totalPixels = 0;

      for (
        let y = startY;
        y < endY;
        y += 1
      ) {
        for (
          let x = 0;
          x < image.width;
          x += 1
        ) {
          const offset =
            (y * image.width + x) *
            image.channels;

          const r =
            (image.data[offset] ?? 0) / 255;

          const g =
            (image.data[offset + 1] ?? 0) / 255;

          const b =
            (image.data[offset + 2] ?? 0) / 255;

          if (
            this.isPurple(
              r,
              g,
              b
            )
          ) {
            purplePixels += 1;
          }

          totalPixels += 1;
        }
      }

      ratios.push(
        totalPixels === 0
          ? 0
          : purplePixels / totalPixels
      );
    }

    return ratios;
  }

  private calculateColumnPurpleRatios(
    image: {
      width: number;
      height: number;
      channels: number;
      data: Uint8Array;
    },
    startY: number,
    endY: number
  ): number[] {
    const ratios: number[] = [];

    const segments =
      this.rowSegments;

    const segmentWidth =
      Math.ceil(
        image.width / segments
      );

    for (
      let segment = 0;
      segment < segments;
      segment += 1
    ) {
      const startX =
        segment * segmentWidth;

      const endX =
        Math.min(
          image.width,
          startX + segmentWidth
        );

      let purplePixels = 0;
      let totalPixels = 0;

      for (
        let y = startY;
        y < endY;
        y += 1
      ) {
        for (
          let x = startX;
          x < endX;
          x += 1
        ) {
          const offset =
            (y * image.width + x) *
            image.channels;

          const r =
            (image.data[offset] ?? 0) / 255;

          const g =
            (image.data[offset + 1] ?? 0) / 255;

          const b =
            (image.data[offset + 2] ?? 0) / 255;

          if (
            this.isPurple(
              r,
              g,
              b
            )
          ) {
            purplePixels += 1;
          }

          totalPixels += 1;
        }
      }

      ratios.push(
        totalPixels === 0
          ? 0
          : purplePixels / totalPixels
      );
    }

    return ratios;
  }

  private isPurple(
    r: number,
    g: number,
    b: number
  ): boolean {
    const max =
      Math.max(r, g, b);

    const min =
      Math.min(r, g, b);

    if (
      max < this.minBrightness
    ) {
      return false;
    }

    const saturation =
      max === 0
        ? 0
        : (max - min) / max;

    if (
      saturation < this.minSaturation
    ) {
      return false;
    }

    return (
      r > b * 0.65 &&
      b > g * 1.15 &&
      r > g * 1.15
    );
  }
}