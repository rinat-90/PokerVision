import {
  spawn,
  type ChildProcessByStdio
} from "node:child_process";

import type {
  Readable
} from "node:stream";

import {
  resolve
} from "node:path";

import sharp from "sharp";

import type {
  FrameSource,
  SourceFrame
} from "./frame-source.js";

export interface ScreenFrameSourceOptions {
  executablePath?: string;
}

const HEADER_SIZE = 4;
const SCREEN_CAPTURE_FPS = 2;

export class ScreenFrameSource
  implements FrameSource {
  private readonly executablePath: string;

  private process:
    ChildProcessByStdio<
      null,
      Readable,
      Readable
    > | null =
    null;

  private startedAt:
    number | null =
    null;

  constructor(
    options: ScreenFrameSourceOptions = {}
  ) {
    this.executablePath =
      options.executablePath ??
      resolve(
        process.cwd(),
        "packages/screen-capture-macos/bin/screen-capture-macos"
      );
  }

  async start(): Promise<void> {
    if (this.process) {
      return;
    }

    this.startedAt =
      performance.now();

    this.process =
      spawn(
        this.executablePath,
        [],
        {
          stdio: [
            "ignore",
            "pipe",
            "pipe"
          ]
        }
      );
  }

  async stop(): Promise<void> {
    const child =
      this.process;

    this.process = null;
    this.startedAt = null;

    if (!child) {
      return;
    }

    child.kill(
      "SIGTERM"
    );
  }

  async *[Symbol.asyncIterator]():
    AsyncIterator<SourceFrame> {
    const child =
      this.process;

    const startedAt =
      this.startedAt;

    if (
      !child ||
      startedAt === null
    ) {
      return;
    }

    let buffer =
      Buffer.alloc(0);

    let frameIndex = 0;

    for await (
      const chunk of child.stdout
      ) {
      buffer =
        Buffer.concat([
          buffer,
          Buffer.from(
            chunk
          )
        ]);

      while (
        buffer.length >=
        HEADER_SIZE
        ) {
        const frameLength =
          buffer.readUInt32BE(
            0
          );

        const totalLength =
          HEADER_SIZE +
          frameLength;

        if (
          buffer.length <
          totalLength
        ) {
          break;
        }

        const data =
          Buffer.from(
            buffer.subarray(
              HEADER_SIZE,
              totalLength
            )
          );

        buffer =
          buffer.subarray(
            totalLength
          );

        const metadata =
          await sharp(
            data
          ).metadata();

        if (
          !metadata.width ||
          !metadata.height
        ) {
          throw new Error(
            "Unable to determine screen frame dimensions"
          );
        }

        yield {
          index:
          frameIndex,

          width:
          metadata.width,

          height:
          metadata.height,

          timestampSeconds:
            frameIndex /
            SCREEN_CAPTURE_FPS,

          data
        };

        frameIndex++;
      }
    }
  }
}