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

describe(
  "PlayerActionRegion on real video",
  () => {
    it(
      "visualizes player action regions",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const frames =
          await extractFrames(
            videoPath,
            {
              startSeconds: 5,
              endSeconds: 6,
              fps: 1
            }
          );

        const frame =
          frames[0];

        if (!frame) {
          throw new Error(
            "Expected frame at 5s"
          );
        }

        const decoder =
          new SharpImageDecoder();

        const tableDetector =
          new PurpleTableDetector(
            decoder
          );

        const tableDetection =
          await tableDetector.detect(
            frame
          );

        if (
          !tableDetection.region
        ) {
          throw new Error(
            "Expected table region"
          );
        }

        const regions =
          createPlayerActionRegions(
            tableDetection.region
          );

        console.log(
          "TABLE REGION:",
          tableDetection.region
        );

        console.log(
          "ACTION REGIONS:",
          regions
        );

        const svg = `
          <svg
            width="${frame.width}"
            height="${frame.height}"
            xmlns="http://www.w3.org/2000/svg"
          >
            ${regions.map(
          (region) => `
                <rect
                  x="${region.x}"
                  y="${region.y}"
                  width="${region.width}"
                  height="${region.height}"
                  fill="none"
                  stroke="red"
                  stroke-width="4"
                />
                <text
                  x="${region.x + 8}"
                  y="${region.y + 24}"
                  fill="red"
                  font-size="24"
                  font-family="sans-serif"
                >
                  Seat ${region.seatIndex}
                </text>
              `
        ).join("")}
          </svg>
        `;

        const outputPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/player-action-regions-debug.png",
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
          "ACTION REGIONS DEBUG SAVED:",
          outputPath
        );

        expect(
          regions
        ).toHaveLength(6);
      }
    );
  }
);