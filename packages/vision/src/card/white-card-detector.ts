import type {
  CroppedFrame
} from "../table/crop-frame.js";

import type {
  CardDetection,
  CardRegion
} from "./types.js";

import type {
  CardDetector
} from "./card-detector.js";

export interface WhiteCardDetectorOptions {
  brightnessThreshold?: number;
  minWhiteRatio?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minAspectRatio?: number;
  maxAspectRatio?: number;
}

export class WhiteCardDetector
  implements CardDetector
{
  private readonly brightnessThreshold: number;
  private readonly minWhiteRatio: number;
  private readonly minWidth: number;
  private readonly maxWidth: number;
  private readonly minHeight: number;
  private readonly maxHeight: number;
  private readonly minAspectRatio: number;
  private readonly maxAspectRatio: number;

  constructor(
    options: WhiteCardDetectorOptions = {}
  ) {
    this.brightnessThreshold =
      options.brightnessThreshold ?? 0.75;

    this.minWhiteRatio =
      options.minWhiteRatio ?? 0.65;

    this.minWidth =
      options.minWidth ?? 20;

    this.maxWidth =
      options.maxWidth ?? 250;

    this.minHeight =
      options.minHeight ?? 30;

    this.maxHeight =
      options.maxHeight ?? 350;

    this.minAspectRatio =
      options.minAspectRatio ?? 0.45;

    this.maxAspectRatio =
      options.maxAspectRatio ?? 0.85;
  }

  async detect(
    frame: CroppedFrame
  ): Promise<CardDetection> {
    const regions =
      this.findCardRegions(
        frame
      );

    return {
      found: regions.length > 0,
      confidence:
        regions.length > 0
          ? 0.5
          : 0,
      regions
    };
  }

  private findCardRegions(
    frame: CroppedFrame
  ): CardRegion[] {
    const regions: CardRegion[] = [];

    const visited =
      new Uint8Array(
        frame.width *
        frame.height
      );

    for (
      let y = 0;
      y < frame.height;
      y += 1
    ) {
      for (
        let x = 0;
        x < frame.width;
        x += 1
      ) {
        const index =
          y *
          frame.width +
          x;

        if (
          visited[index] === 1
        ) {
          continue;
        }

        if (
          !this.isCardPixel(
            frame,
            x,
            y
          )
        ) {
          continue;
        }

        const component =
          this.floodFill(
            frame,
            x,
            y,
            visited
          );

        if (
          component.width <
          this.minWidth ||
          component.width >
          this.maxWidth ||
          component.height <
          this.minHeight ||
          component.height >
          this.maxHeight
        ) {
          continue;
        }

        const aspectRatio =
          component.width /
          component.height;

        if (
          aspectRatio <
          this.minAspectRatio ||
          aspectRatio >
          this.maxAspectRatio
        ) {
          continue;
        }

        const area =
          component.width *
          component.height;

        const cardRatio =
          component.pixelCount /
          area;

        if (
          cardRatio <
          this.minWhiteRatio
        ) {
          continue;
        }

        regions.push({
          x: component.minX,
          y: component.minY,
          width: component.width,
          height: component.height
        });
      }
    }

    return regions;
  }

  private floodFill(
    frame: CroppedFrame,
    startX: number,
    startY: number,
    visited: Uint8Array
  ): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    pixelCount: number;
  } {
    const queue: Array<
      [number, number]
    > = [
      [
        startX,
        startY
      ]
    ];

    visited[
    startY *
    frame.width +
    startX
      ] = 1;

    let minX = startX;
    let maxX = startX;
    let minY = startY;
    let maxY = startY;
    let pixelCount = 0;

    while (
      queue.length > 0
      ) {
      const current =
        queue.shift();

      if (!current) {
        continue;
      }

      const [x, y] =
        current;

      pixelCount += 1;

      minX = Math.min(
        minX,
        x
      );

      maxX = Math.max(
        maxX,
        x
      );

      minY = Math.min(
        minY,
        y
      );

      maxY = Math.max(
        maxY,
        y
      );

      const neighbors: Array<{
        x: number;
        y: number;
      }> = [
        {
          x: x - 1,
          y
        },
        {
          x: x + 1,
          y
        },
        {
          x,
          y: y - 1
        },
        {
          x,
          y: y + 1
        }
      ];

      for (
        const neighbor of neighbors
        ) {
        const nextX =
          neighbor.x;

        const nextY =
          neighbor.y;

        if (
          nextX < 0 ||
          nextX >= frame.width ||
          nextY < 0 ||
          nextY >= frame.height
        ) {
          continue;
        }

        const nextIndex =
          nextY *
          frame.width +
          nextX;

        if (
          visited[nextIndex] === 1
        ) {
          continue;
        }

        if (
          !this.isCardPixel(
            frame,
            nextX,
            nextY
          )
        ) {
          continue;
        }

        visited[nextIndex] = 1;

        queue.push([
          nextX,
          nextY
        ]);
      }
    }

    return {
      minX,
      minY,
      maxX,
      maxY,
      width:
        maxX -
        minX +
        1,
      height:
        maxY -
        minY +
        1,
      pixelCount
    };
  }

  private isCardPixel(
    frame: CroppedFrame,
    x: number,
    y: number
  ): boolean {
    const offset =
      (
        y *
        frame.width +
        x
      ) *
      frame.channels;

    const r =
      (
        frame.data[offset] ??
        0
      ) / 255;

    const g =
      (
        frame.data[
        offset + 1
          ] ??
        0
      ) / 255;

    const b =
      (
        frame.data[
        offset + 2
          ] ??
        0
      ) / 255;

    const brightness =
      (
        r +
        g +
        b
      ) / 3;

    if (
      brightness <
      this.brightnessThreshold
    ) {
      return false;
    }

    const isWhite =
      r >=
      this.brightnessThreshold &&
      g >=
      this.brightnessThreshold &&
      b >=
      this.brightnessThreshold;

    if (isWhite) {
      return true;
    }

    const isLightBlue =
      b > g &&
      g > r &&
      b - r >= 0.08 &&
      brightness >= 0.78;

    return isLightBlue;
  }
}