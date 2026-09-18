import {
  describe,
  expect,
  it
} from "vitest";

import {
  ScreenFrameSource
} from "./screen-frame-source.js";

describe(
  "ScreenFrameSource",
  () => {
    it(
      "receives live JPEG frames from macOS screen capture",
      async () => {
        const source =
          new ScreenFrameSource();

        await source.start();

        const frames = [];

        try {
          for await (
            const frame of source
            ) {
            frames.push(frame);

            if (
              frames.length >= 2
            ) {
              break;
            }
          }
        } finally {
          await source.stop();
        }

        expect(
          frames
        ).toHaveLength(2);

        expect(
          frames[0]?.timestampSeconds
        ).toBe(0);

        expect(
          frames[1]?.timestampSeconds
        ).toBe(0.5);

        expect(
          frames[0]?.data[0]
        ).toBe(0xff);

        expect(
          frames[0]?.data[1]
        ).toBe(0xd8);

        expect(
          frames[0]?.data.length
        ).toBeGreaterThan(
          1_000
        );

        expect(
          frames[0]?.width
        ).toBeGreaterThan(0);

        expect(
          frames[0]?.height
        ).toBeGreaterThan(0);

        expect(
          frames[1]?.width
        ).toBe(
          frames[0]?.width
        );

        expect(
          frames[1]?.height
        ).toBe(
          frames[0]?.height
        );
      },
      10_000
    );
  }
);