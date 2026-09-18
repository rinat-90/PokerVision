import {
  describe,
  expect,
  it
} from "vitest";

import {
  fileURLToPath
} from "node:url";

import sharp from "sharp";

import {
  extractFrames
} from "@poker-vision/video";

import {
  SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import {
  PurpleTableDetector
} from "../table/purple-table-detector.js";

import {
  createPlayerActionRegions
} from "./player-action-region.js";

import {
  createBetAmountRegions
} from "./bet-amount-region.js";

describe(
  "Bet amount region diagnostic on real video",
  () => {
    it(
      "saves bet amount regions at interesting timestamps",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const timestamps = [
          8,
          9,
          11,
          20,
          21,
          25
        ];

        const decoder =
          new SharpImageDecoder();

        const tableDetector =
          new PurpleTableDetector(
            decoder
          );

        for (
          const timestampSeconds
          of timestamps
        ) {
          const frames =
            await extractFrames(
              videoPath,
              {
                startSeconds:
                  timestampSeconds,
                endSeconds:
                  timestampSeconds + 1,
                fps: 1
              }
            );

          const frame =
            frames[0];

          if (!frame) {
            throw new Error(
              `Expected frame at ${timestampSeconds}s`
            );
          }

          const tableDetection =
            await tableDetector.detect(
              frame
            );

          if (
            !tableDetection.region
          ) {
            throw new Error(
              `Expected table at ${timestampSeconds}s`
            );
          }

          const actionRegions =
            createPlayerActionRegions(
              tableDetection.region
            );

          const amountRegions =
            createBetAmountRegions(
              actionRegions
            );

          const svg = `
            <svg
              width="${frame.width}"
              height="${frame.height}"
              xmlns="http://www.w3.org/2000/svg"
            >
              ${amountRegions
                .map(
                  (region) => `
                    <rect
                      x="${region.x}"
                      y="${region.y}"
                      width="${region.width}"
                      height="${region.height}"
                      fill="none"
                      stroke="lime"
                      stroke-width="4"
                    />
                    <text
                      x="${region.x + 5}"
                      y="${region.y + 20}"
                      fill="lime"
                      font-size="20"
                      font-family="sans-serif"
                    >
                      S${region.seatIndex}
                    </text>
                  `
                )
                .join("")}
            </svg>
          `;

          const outputPath =
            fileURLToPath(
              new URL(
                `../../../video/fixtures/real/bet-amount-regions-${timestampSeconds}s.png`,
                import.meta.url
              )
            );

          await sharp(
            frame.data
          )
            .composite([
              {
                input:
                  Buffer.from(svg),
                top: 0,
                left: 0
              }
            ])
            .png()
            .toFile(
              outputPath
            );

          console.log(
            `SAVED ${timestampSeconds}s:`,
            outputPath
          );
        }

        expect(
          timestamps
        ).toHaveLength(6);
      }
    );
  }
);
