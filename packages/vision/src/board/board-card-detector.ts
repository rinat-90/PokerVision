import type {
  CroppedFrame
} from "../table/crop-frame.js";

export interface BoardCardRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoardCardDetection {
  count: number;
  regions: BoardCardRegion[];
}

export interface BoardCardDetectorOptions {
  brightnessThreshold?: number;
  minWhiteRatio?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

interface Component {
  x: number;
  y: number;
  width: number;
  height: number;
  pixelCount: number;
}

export class BoardCardDetector {
  private readonly brightnessThreshold:
    number;

  private readonly minWhiteRatio:
    number;

  private readonly minWidth:
    number;

  private readonly maxWidth:
    number;

  private readonly minHeight:
    number;

  private readonly maxHeight:
    number;

  constructor(
    options:
    BoardCardDetectorOptions = {}
  ) {
    this.brightnessThreshold =
      options.brightnessThreshold ??
      0.75;

    this.minWhiteRatio =
      options.minWhiteRatio ??
      0.5;

    this.minWidth =
      options.minWidth ?? 70;

    this.maxWidth =
      options.maxWidth ?? 150;

    this.minHeight =
      options.minHeight ?? 100;

    this.maxHeight =
      options.maxHeight ?? 190;
  }

  detect(
    frame: CroppedFrame
  ): BoardCardDetection {
    const visited =
      new Uint8Array(
        frame.width *
        frame.height
      );

    const components:
      Component[] = [];

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
          visited[index]
        ) {
          continue;
        }

        if (
          !this.isWhitePixel(
            frame,
            x,
            y
          )
        ) {
          visited[index] = 1;
          continue;
        }

        const component =
          this.collectComponent(
            frame,
            x,
            y,
            visited
          );

        components.push(
          component
        );
      }
    }

    const regions =
      components
        .filter(
          (component) =>
            this.isCardComponent(
              component
            )
        )
        .map(
          (component) => ({
            x:
            component.x,
            y:
            component.y,
            width:
            component.width,
            height:
            component.height
          })
        )
        .sort(
          (a, b) =>
            a.x - b.x
        );

    return {
      count:
      regions.length,
      regions
    };
  }

  private collectComponent(
    frame: CroppedFrame,
    startX: number,
    startY: number,
    visited: Uint8Array
  ): Component {
    const queue: [
      number,
      number
    ][] = [
      [
        startX,
        startY
      ]
    ];

    let cursor = 0;

    let minX = startX;
    let maxX = startX;
    let minY = startY;
    let maxY = startY;

    let pixelCount = 0;

    while (
      cursor <
      queue.length
      ) {
      const [
        x,
        y
      ] =
      queue[cursor] ?? [
        0,
        0
      ];

      cursor += 1;

      if (
        x < 0 ||
        y < 0 ||
        x >= frame.width ||
        y >= frame.height
      ) {
        continue;
      }

      const index =
        y *
        frame.width +
        x;

      if (
        visited[index]
      ) {
        continue;
      }

      visited[index] = 1;

      if (
        !this.isWhitePixel(
          frame,
          x,
          y
        )
      ) {
        continue;
      }

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

      queue.push(
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
      );
    }

    return {
      x: minX,
      y: minY,
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

  private isCardComponent(
    component: Component
  ): boolean {
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
      return false;
    }

    const area =
      component.width *
      component.height;

    const whiteRatio =
      component.pixelCount /
      area;

    return (
      whiteRatio >=
      this.minWhiteRatio
    );
  }

  private isWhitePixel(
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

    return (
      r >=
      this.brightnessThreshold &&
      g >=
      this.brightnessThreshold &&
      b >=
      this.brightnessThreshold
    );
  }
}