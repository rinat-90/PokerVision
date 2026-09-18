import {
  describe,
  expect,
  it
} from "vitest";

import {
  fileURLToPath
} from "node:url";

import {
  dirname,
  resolve
} from "node:path";

import {
  VideoFrameSource
} from "./video-frame-source.js";

const currentDirectory =
  dirname(
    fileURLToPath(
      import.meta.url
    )
  );

const fixturePath =
  resolve(
    currentDirectory,
    "../../../video/fixtures/test-video.mp4"
  );

describe(
  "VideoFrameSource",
  () => {
    it(
      "provides video frames through the FrameSource interface",
      async () => {
        const source =
          new VideoFrameSource(
            fixturePath,
            {
              frameRequest: {
                fps: 2,
                startSeconds: 0,
                endSeconds: 1
              }
            }
          );

        await source.start();

        const frames = [];

        for await (
          const frame of source
          ) {
          frames.push(frame);
        }

        await source.stop();

        expect(
          frames.length
        ).toBeGreaterThan(0);

        expect(
          frames[0]?.width
        ).toBeGreaterThan(0);

        expect(
          frames[0]?.height
        ).toBeGreaterThan(0);

        expect(
          frames[0]?.timestampSeconds
        ).toBeGreaterThanOrEqual(0);

        expect(
          frames[0]?.data.length
        ).toBeGreaterThan(0);
      },
      10_000
    );

    it(
      "does not provide frames before start",
      async () => {
        const source =
          new VideoFrameSource(
            fixturePath,
            {
              frameRequest: {
                fps: 1,
                startSeconds: 0,
                endSeconds: 1
              }
            }
          );

        const frames = [];

        for await (
          const frame of source
          ) {
          frames.push(frame);
        }

        expect(
          frames
        ).toEqual([]);
      }
    );
  }
);