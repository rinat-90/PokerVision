import {
  describe,
  expect,
  it
} from "vitest";

import type {
  FrameSource,
  SourceFrame
} from "./frame-source.js";

class TestFrameSource
  implements FrameSource {
  private running = false;

  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  async *[Symbol.asyncIterator]():
    AsyncIterator<SourceFrame> {
    if (!this.running) {
      return;
    }

    yield {
      index: 0,
      width: 1920,
      height: 1080,
      timestampSeconds: 0,
      data: Buffer.from([
        1,
        2,
        3
      ])
    };

    yield {
      index: 1,
      width: 1920,
      height: 1080,
      timestampSeconds: 0.5,
      data: Buffer.from([
        4,
        5,
        6
      ])
    };
  }
}

describe(
  "FrameSource",
  () => {
    it(
      "provides frames asynchronously after start",
      async () => {
        const source =
          new TestFrameSource();

        await source.start();

        const frames: SourceFrame[] =
          [];

        for await (
          const frame of source
          ) {
          frames.push(frame);
        }

        await source.stop();

        expect(
          frames
        ).toHaveLength(2);

        expect(
          frames.map(
            frame =>
              frame.timestampSeconds
          )
        ).toEqual([
          0,
          0.5
        ]);

        expect(
          frames[0]?.width
        ).toBe(1920);

        expect(
          frames[0]?.height
        ).toBe(1080);
      }
    );

    it(
      "does not provide frames before start",
      async () => {
        const source =
          new TestFrameSource();

        const frames: SourceFrame[] =
          [];

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