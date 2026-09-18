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

import {
  CardComponentGrouper
} from "./card-component-grouper.js";

import type {
  CardComponent
} from "./card-component.js";

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
      found:
        regions.length > 0,
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
    const components: CardComponent[] = [];

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
          component.width < 3 ||
          component.height < 3
        ) {
          continue;
        }

        components.push({
          x:
          component.minX,
          y:
          component.minY,
          width:
          component.width,
          height:
          component.height,
          pixelCount:
          component.pixelCount
        });
      }
    }

    const grouper =
      new CardComponentGrouper({
        maxHorizontalGap: 8,
        maxVerticalGap: 8,
        maxWidth:
        this.maxWidth,
        maxHeight:
        this.maxHeight
      });

    const groupedRegions =
      grouper.group(
        components
      );

    return groupedRegions.filter(
      (region) => {
        const density =
          this.getRegionPixelDensity(
            region,
            components
          );

        if (
          density <
          this.minWhiteRatio
        ) {
          return false;
        }

        const aspectRatio =
          region.width /
          region.height;

        const isIndividualCard =
          region.width >=
          this.minWidth &&
          region.width <=
          this.maxWidth &&
          region.height >=
          this.minHeight &&
          region.height <=
          this.maxHeight &&
          aspectRatio >=
          this.minAspectRatio &&
          aspectRatio <=
          this.maxAspectRatio;

        const isCardBackCluster =
          region.width >= 80 &&
          region.width <= 150 &&
          region.height >= 45 &&
          region.height <= 80 &&
          aspectRatio >= 1.5 &&
          aspectRatio <= 2.8;

        return (
          isIndividualCard ||
          isCardBackCluster
        );
      }
    );
  }

  private getRegionPixelDensity(
    region: CardRegion,
    components: CardComponent[]
  ): number {
    const pixelCount =
      components
        .filter(
          (component) =>
            component.x >=
            region.x &&
            component.y >=
            region.y &&
            component.x +
            component.width <=
            region.x +
            region.width &&
            component.y +
            component.height <=
            region.y +
            region.height
        )
        .reduce(
          (
            total,
            component
          ) =>
            total +
            component.pixelCount,
          0
        );

    const area =
      region.width *
      region.height;

    if (area === 0) {
      return 0;
    }

    return (
      pixelCount /
      area
    );
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

      minX =
        Math.min(
          minX,
          x
        );

      maxX =
        Math.max(
          maxX,
          x
        );

      minY =
        Math.min(
          minY,
          y
        );

      maxY =
        Math.max(
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
        frame.data[
          offset
          ] ?? 0
      ) / 255;

    const g =
      (
        frame.data[
        offset + 1
          ] ?? 0
      ) / 255;

    const b =
      (
        frame.data[
        offset + 2
          ] ?? 0
      ) / 255;

    const brightness =
      (
        r +
        g +
        b
      ) / 3;

    /*
     * Face-up cards:
     * bright / near-white surface.
     */
    const isWhite =
      brightness >=
      this.brightnessThreshold &&
      r >=
      this.brightnessThreshold &&
      g >=
      this.brightnessThreshold &&
      b >=
      this.brightnessThreshold;

    if (isWhite) {
      return true;
    }

    /*
     * Face-down PokerStars cards.
     *
     * Real-video samples are roughly:
     *
     * R: 94–118
     * G: 148–184
     * B: 176–218
     *
     * Brightness:
     * ~0.55–0.68
     */
    const isLightBlue =
      b > g &&
      g > r &&
      g - r >= 0.15 &&
      b - r >= 0.25 &&
      brightness >= 0.5 &&
      brightness <= 0.75;

    return isLightBlue;
  }
}