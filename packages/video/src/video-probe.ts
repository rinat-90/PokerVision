import { execFile } from "node:child_process";
import { promisify } from "node:util";

import type { VideoMetadata } from "./types.js";

const execFileAsync = promisify(execFile);

interface FFprobeStream {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  r_frame_rate?: string;
  nb_frames?: string;
}

interface FFprobeFormat {
  format_name?: string;
  duration?: string;
}

interface FFprobeOutput {
  streams?: FFprobeStream[];
  format?: FFprobeFormat;
}

export async function probeVideo(
  filePath: string
): Promise<VideoMetadata> {
  const { stdout } = await execFileAsync(
    "ffprobe",
    [
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_streams",
      "-show_format",
      filePath
    ]
  );

  const result =
    JSON.parse(stdout) as FFprobeOutput;

  const videoStream =
    result.streams?.find(
      (stream) =>
        stream.codec_type === "video"
    );

  if (videoStream === undefined) {
    throw new Error(
      `No video stream found: ${filePath}`
    );
  }

  const width = videoStream.width;
  const height = videoStream.height;

  if (
    width === undefined ||
    height === undefined
  ) {
    throw new Error(
      `Video dimensions are missing: ${filePath}`
    );
  }

  const fps =
    parseFrameRate(
      videoStream.r_frame_rate
    );

  const durationSeconds =
    parseNumber(
      result.format?.duration
    );

  const frameCount =
    parseFrameCount(
      videoStream.nb_frames,
      durationSeconds,
      fps
    );

  return {
    width,
    height,
    fps,
    durationSeconds,
    frameCount,
    codec:
      videoStream.codec_name ??
      "unknown",
    format:
      result.format?.format_name ??
      "unknown"
  };
}

function parseFrameRate(
  value: string | undefined
): number {
  if (value === undefined) {
    return 0;
  }

  const [numerator, denominator] =
    value.split("/");

  const numeratorNumber =
    Number(numerator);

  const denominatorNumber =
    Number(denominator);

  if (
    !Number.isFinite(numeratorNumber) ||
    !Number.isFinite(denominatorNumber) ||
    denominatorNumber === 0
  ) {
    return 0;
  }

  return (
    numeratorNumber /
    denominatorNumber
  );
}

function parseNumber(
  value: string | undefined
): number {
  if (value === undefined) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function parseFrameCount(
  value: string | undefined,
  durationSeconds: number,
  fps: number
): number {
  if (value !== undefined) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (
    durationSeconds > 0 &&
    fps > 0
  ) {
    return Math.round(
      durationSeconds * fps
    );
  }

  return 0;
}