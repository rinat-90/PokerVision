import { spawn } from "node:child_process";

import type {
  VideoFrame,
  VideoFrameRequest
} from "./types.js";

import {
  probeVideo
} from "./video-probe.js";

const DEFAULT_FPS = 2;

export async function extractFrames(
  filePath: string,
  request: VideoFrameRequest = {}
): Promise<VideoFrame[]> {
  const metadata =
    await probeVideo(filePath);

  const fps =
    request.fps ?? DEFAULT_FPS;

  if (fps <= 0) {
    throw new Error(
      `FPS must be greater than 0: ${fps}`
    );
  }

  const startSeconds =
    request.startSeconds ?? 0;

  const endSeconds =
    request.endSeconds ??
    metadata.durationSeconds;

  if (startSeconds < 0) {
    throw new Error(
      `startSeconds must be >= 0: ${startSeconds}`
    );
  }

  if (endSeconds <= startSeconds) {
    throw new Error(
      `endSeconds must be greater than startSeconds`
    );
  }

  const width = metadata.width;
  const height = metadata.height;

  const frameInterval =
    1 / fps;

  const jpegFrames =
    await extractJpegFrames(
      filePath,
      startSeconds,
      endSeconds,
      fps
    );

  return jpegFrames.map(
    (data, index) => ({
      index,
      timestampSeconds:
        startSeconds +
        index * frameInterval,
      data,
      width,
      height
    })
  );
}

function extractJpegFrames(
  filePath: string,
  startSeconds: number,
  endSeconds: number,
  fps: number
): Promise<Uint8Array[]> {
  return new Promise(
    (resolve, reject) => {
      const duration =
        endSeconds - startSeconds;

      const process =
        spawn(
          "ffmpeg",
          [
            "-ss",
            String(startSeconds),
            "-i",
            filePath,
            "-t",
            String(duration),
            "-vf",
            `fps=${fps}`,
            "-f",
            "image2pipe",
            "-vcodec",
            "mjpeg",
            "-q:v",
            "2",
            "pipe:1"
          ],
          {
            stdio: [
              "ignore",
              "pipe",
              "pipe"
            ]
          }
        );

      const chunks: Buffer[] = [];
      let stderr = "";

      process.stdout.on(
        "data",
        (chunk: Buffer) => {
          chunks.push(chunk);
        }
      );

      process.stderr.on(
        "data",
        (chunk: Buffer) => {
          stderr += chunk.toString();
        }
      );

      process.on(
        "error",
        (error) => {
          reject(error);
        }
      );

      process.on(
        "close",
        (code) => {
          if (code !== 0) {
            reject(
              new Error(
                `FFmpeg frame extraction failed ` +
                `(exit code ${code}): ${stderr}`
              )
            );

            return;
          }

          const output =
            Buffer.concat(chunks);

          resolve(
            splitJpegFrames(output)
          );
        }
      );
    }
  );
}

function splitJpegFrames(
  data: Buffer
): Uint8Array[] {
  const frames: Uint8Array[] = [];

  let start = -1;

  for (
    let index = 0;
    index < data.length - 1;
    index++
  ) {
    const first =
      data[index];

    const second =
      data[index + 1];

    if (
      first === 0xff &&
      second === 0xd8
    ) {
      start = index;
      break;
    }
  }

  while (start !== -1) {
    let end = -1;

    for (
      let index = start + 2;
      index < data.length - 1;
      index++
    ) {
      const first =
        data[index];

      const second =
        data[index + 1];

      if (
        first === 0xff &&
        second === 0xd9
      ) {
        end = index + 2;
        break;
      }
    }

    if (end === -1) {
      break;
    }

    frames.push(
      new Uint8Array(
        data.subarray(start, end)
      )
    );

    start = -1;

    for (
      let index = end;
      index < data.length - 1;
      index++
    ) {
      const first =
        data[index];

      const second =
        data[index + 1];

      if (
        first === 0xff &&
        second === 0xd8
      ) {
        start = index;
        break;
      }
    }
  }

  return frames;
}