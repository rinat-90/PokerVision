import type {
  CroppedFrame
} from "../table/crop-frame.js";

export interface BetChipRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BetChipComponent {
  pixelCount: number;
  region: BetChipRegion;
}

export interface BetChipDetection {
  present: boolean;
  matchingPixelRatio: number;
  region: BetChipRegion | null;
}

export interface BetChipDetectorOptions {
  minimumBlueRatio?: number;
  minimumPixelRatio?: number;
}

interface BlueMaskResult {
  mask: Uint8Array;
  matchingPixels: number;
  pixelCount: number;
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
      width,
      height,
      channels
    } = frame;

    const pixelCount =
      width * height;

    if (
      pixelCount === 0 ||
      channels < 3
    ) {
      return {
        present: false,
        matchingPixelRatio: 0,
        region: null
      };
    }

    const maskResult =
      this.createBlueMask(
        frame
      );

    const matchingPixelRatio =
      maskResult.matchingPixels /
      maskResult.pixelCount;

    const present =
      matchingPixelRatio >=
      this.minimumPixelRatio;

    if (
      !present ||
      maskResult.matchingPixels === 0
    ) {
      return {
        present,
        matchingPixelRatio,
        region: null
      };
    }

    const components =
      this.findComponents(
        maskResult.mask,
        width,
        height
      );

    const largestComponent =
      components.reduce<
        BetChipComponent | null
      >(
        (
          largest,
          component
        ) => {
          if (
            largest === null ||
            component.pixelCount >
            largest.pixelCount
          ) {
            return component;
          }

          return largest;
        },
        null
      );

    return {
      present,
      matchingPixelRatio,

      region:
        largestComponent?.region ??
        null
    };
  }

  detectComponents(
    frame: CroppedFrame
  ): BetChipComponent[] {
    const {
      width,
      height,
      channels
    } = frame;

    if (
      width * height === 0 ||
      channels < 3
    ) {
      return [];
    }

    const maskResult =
      this.createBlueMask(
        frame
      );

    if (
      maskResult.matchingPixels === 0
    ) {
      return [];
    }

    return this.findComponents(
      maskResult.mask,
      width,
      height
    );
  }

  private createBlueMask(
    frame: CroppedFrame
  ): BlueMaskResult {
    const {
      data,
      width,
      height,
      channels
    } = frame;

    const pixelCount =
      width * height;

    const mask =
      new Uint8Array(
        pixelCount
      );

    let matchingPixels = 0;

    for (
      let y = 0;
      y < height;
      y += 1
    ) {
      for (
        let x = 0;
        x < width;
        x += 1
      ) {
        const pixelIndex =
          y * width +
          x;

        const dataIndex =
          pixelIndex *
          channels;

        if (
          dataIndex + 2 >=
          data.length
        ) {
          continue;
        }

        const red =
          data[dataIndex] ?? 0;

        const green =
          data[dataIndex + 1] ?? 0;

        const blue =
          data[dataIndex + 2] ?? 0;

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
          !blueDominatesRed ||
          !blueDominatesGreen ||
          !sufficientlyBlue
        ) {
          continue;
        }

        mask[pixelIndex] = 1;
        matchingPixels += 1;
      }
    }

    return {
      mask,
      matchingPixels,
      pixelCount
    };
  }

  private findComponents(
    mask: Uint8Array,
    width: number,
    height: number
  ): BetChipComponent[] {
    const visited =
      new Uint8Array(
        mask.length
      );

    const components:
      BetChipComponent[] = [];

    for (
      let y = 0;
      y < height;
      y += 1
    ) {
      for (
        let x = 0;
        x < width;
        x += 1
      ) {
        const startIndex =
          y * width +
          x;

        if (
          mask[startIndex] !== 1 ||
          visited[startIndex] === 1
        ) {
          continue;
        }

        const component =
          this.collectComponent(
            mask,
            visited,
            width,
            height,
            x,
            y
          );

        components.push(
          component
        );
      }
    }

    return components;
  }

  private collectComponent(
    mask: Uint8Array,
    visited: Uint8Array,
    width: number,
    height: number,
    startX: number,
    startY: number
  ): BetChipComponent {
    const queue: number[] = [
      startY * width +
      startX
    ];

    visited[
    startY * width +
    startX
      ] = 1;

    let queueIndex = 0;
    let componentPixelCount = 0;

    let minX = startX;
    let minY = startY;
    let maxX = startX;
    let maxY = startY;

    while (
      queueIndex <
      queue.length
      ) {
      const pixelIndex =
        queue[queueIndex];

      queueIndex += 1;

      if (
        pixelIndex === undefined
      ) {
        continue;
      }

      const x =
        pixelIndex %
        width;

      const y =
        Math.floor(
          pixelIndex /
          width
        );

      componentPixelCount += 1;

      minX =
        Math.min(
          minX,
          x
        );

      minY =
        Math.min(
          minY,
          y
        );

      maxX =
        Math.max(
          maxX,
          x
        );

      maxY =
        Math.max(
          maxY,
          y
        );

      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
      ] as const;

      for (
        const [
          neighborX,
          neighborY
        ]
        of neighbors
        ) {
        if (
          neighborX < 0 ||
          neighborY < 0 ||
          neighborX >= width ||
          neighborY >= height
        ) {
          continue;
        }

        const neighborIndex =
          neighborY *
          width +
          neighborX;

        if (
          mask[neighborIndex] !== 1 ||
          visited[neighborIndex] === 1
        ) {
          continue;
        }

        visited[
          neighborIndex
          ] = 1;

        queue.push(
          neighborIndex
        );
      }
    }

    return {
      pixelCount:
      componentPixelCount,

      region: {
        x: minX,
        y: minY,

        width:
          maxX -
          minX +
          1,

        height:
          maxY -
          minY +
          1
      }
    };
  }
}