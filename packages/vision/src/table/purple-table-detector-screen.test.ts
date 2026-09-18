import {
  describe,
  expect,
  it
} from "vitest";

import {
  ScreenFrameSource
} from "../source/screen-frame-source.js";

import {
  SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import {
  PurpleTableDetector
} from "./purple-table-detector.js";

describe(
  "PurpleTableDetector on live screen",
  () => {
    it(
      "detects the poker table from a live screen frame",
      async () => {
        const source =
          new ScreenFrameSource();

        const detector =
          new PurpleTableDetector(
            new SharpImageDecoder(),
            {
              minPixelRatio: 0.01
            }
          );

        await source.start();

        try {
          for await (
            const frame of source
            ) {
            console.log(
              "SCREEN FRAME:",
              {
                index:
                frame.index,
                width:
                frame.width,
                height:
                frame.height,
                timestampSeconds:
                frame.timestampSeconds
              }
            );

            const result =
              await detector.detect(
                frame
              );

            console.log(
              "TABLE DETECTION:",
              result
            );

            expect(
              result.found
            ).toBe(true);

            expect(
              result.region
            ).toBeDefined();

            if (
              result.region
            ) {
              expect(
                result.region.width
              ).toBeGreaterThan(
                0
              );

              expect(
                result.region.height
              ).toBeGreaterThan(
                0
              );
            }

            break;
          }
        } finally {
          await source.stop();
        }
      },
      10_000
    );
  }
);