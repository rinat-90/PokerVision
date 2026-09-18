import {
  describe,
  expect,
  it
} from "vitest";

import type {
  FrameSource,
  SourceFrame
} from "../source/frame-source.js";

import {
  LiveVisionSession
} from "./live-vision-session.js";

class TestFrameSource
  implements FrameSource {
  started = false;
  stopped = false;

  async start(): Promise<void> {
    this.started = true;
  }

  async stop(): Promise<void> {
    this.stopped = true;
  }

  async *[Symbol.asyncIterator]():
    AsyncIterator<SourceFrame> {
    if (!this.started) {
      return;
    }

    yield {
      index: 0,
      width: 1920,
      height: 1080,
      timestampSeconds: 0,
      data: Buffer.from([
        1
      ])
    };

    yield {
      index: 1,
      width: 1920,
      height: 1080,
      timestampSeconds: 0.5,
      data: Buffer.from([
        2
      ])
    };
  }
}

describe(
  "LiveVisionSession",
  () => {
    it(
      "processes source frames in order",
      async () => {
        const source =
          new TestFrameSource();

        const processedIndexes:
          number[] = [];

        const session =
          new LiveVisionSession(
            source,
            {
              async process(
                frame
              ) {
                processedIndexes.push(
                  frame.index
                );
              }
            }
          );

        await session.start();

        expect(
          processedIndexes
        ).toEqual([
          0,
          1
        ]);

        expect(
          source.started
        ).toBe(true);

        expect(
          source.stopped
        ).toBe(true);

        expect(
          session.isRunning()
        ).toBe(false);
      }
    );

    it(
      "can stop while processing frames",
      async () => {
        const source =
          new TestFrameSource();

        const processedIndexes:
          number[] = [];

        let session:
          LiveVisionSession;

        session =
          new LiveVisionSession(
            source,
            {
              async process(
                frame
              ) {
                processedIndexes.push(
                  frame.index
                );

                await session.stop();
              }
            }
          );

        await session.start();

        expect(
          processedIndexes
        ).toEqual([
          0
        ]);

        expect(
          source.stopped
        ).toBe(true);

        expect(
          session.isRunning()
        ).toBe(false);
      }
    );
  }
);