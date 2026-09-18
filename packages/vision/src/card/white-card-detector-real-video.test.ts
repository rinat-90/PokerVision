import {
  describe,
  expect,
  it
} from "vitest";

import sharp, {
  type Channels
} from "sharp";

import {
  fileURLToPath
} from "node:url";

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
  cropFrame
} from "../table/crop-frame.js";

import {
  expandRegion
} from "../table/expand-region.js";

import {
  createSixMaxSeatAnchors
} from "../seat/seat-layout.js";

import {
  WhiteCardDetector
} from "./white-card-detector.js";

describe(
  "WhiteCardDetector on real video",
  () => {
    it(
      "detects face-down card clusters on the poker table",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const outputPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/table-crop.png",
              import.meta.url
            )
          );

        const sceneOutputPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/table-scene-crop.png",
              import.meta.url
            )
          );

        const seatDebugOutputPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/seat-layout-debug.png",
              import.meta.url
            )
          );

        const debugOutputPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/card-detection-debug.png",
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

        expect(frames.length)
          .toBe(1);

        const frame =
          frames[0];

        expect(frame)
          .toBeDefined();

        if (!frame) {
          throw new Error(
            "Expected a video frame"
          );
        }

        console.log(
          "FULL FRAME:",
          {
            width:
            frame.width,
            height:
            frame.height
          }
        );

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

        expect(tableDetection.found)
          .toBe(true);

        expect(tableDetection.region)
          .toBeDefined();

        if (!tableDetection.region) {
          throw new Error(
            "Expected table region"
          );
        }

        console.log(
          "TABLE REGION:",
          tableDetection.region
        );

        /*
         * Expand the detected table oval to include
         * the surrounding player/seat area.
         */
        const sceneRegion =
          expandRegion(
            tableDetection.region,
            {
              top:
                Math.round(
                  tableDetection.region.height *
                  0.5
                ),
              right:
                Math.round(
                  tableDetection.region.width *
                  0.125
                ),
              bottom:
                Math.round(
                  tableDetection.region.height *
                  0.5
                ),
              left:
                Math.round(
                  tableDetection.region.width *
                  0.125
                )
            },
            {
              width:
              frame.width,
              height:
              frame.height
            }
          );

        console.log(
          "TABLE SCENE REGION:",
          sceneRegion
        );

        const sceneCropped =
          await cropFrame(
            frame,
            sceneRegion,
            decoder
          );

        await sharp(
          Buffer.from(
            sceneCropped.data
          ),
          {
            raw: {
              width:
              sceneCropped.width,
              height:
              sceneCropped.height,
              channels:
                sceneCropped.channels as Channels
            }
          }
        )
          .png()
          .toFile(
            sceneOutputPath
          );

        console.log(
          "TABLE SCENE SAVED:",
          sceneOutputPath
        );

        /*
         * Generate the six expected seat positions
         * around the detected table.
         *
         * Anchors are generated in full-frame
         * coordinates, so convert them into
         * scene-crop coordinates before drawing.
         */
        const seatAnchors =
          createSixMaxSeatAnchors(
            tableDetection.region
          );

        console.log(
          "SEAT ANCHORS:",
          seatAnchors
        );

        const seatOverlay =
          seatAnchors.map(
            (anchor) => {
              const x =
                Math.round(
                  anchor.x -
                  sceneRegion.x
                );

              const y =
                Math.round(
                  anchor.y -
                  sceneRegion.y
                );

              const overlayWidth =
                100;

              const overlayHeight =
                50;

              const left =
                Math.max(
                  0,
                  Math.min(
                    sceneCropped.width -
                    overlayWidth,
                    x -
                    overlayWidth / 2
                  )
                );

              const top =
                Math.max(
                  0,
                  Math.min(
                    sceneCropped.height -
                    overlayHeight,
                    y -
                    overlayHeight / 2
                  )
                );

              return {
                input:
                  Buffer.from(
                    `<svg
                      width="${overlayWidth}"
                      height="${overlayHeight}"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="50"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="lime"
                        stroke-width="4"
                      />
                      <text
                        x="50"
                        y="30"
                        text-anchor="middle"
                        font-family="Arial"
                        font-size="16"
                        font-weight="bold"
                        fill="white"
                        stroke="black"
                        stroke-width="3"
                        paint-order="stroke"
                      >
                        ${anchor.index}
                      </text>
                    </svg>`
                  ),
                left:
                  Math.round(
                    left
                  ),
                top:
                  Math.round(
                    top
                  )
              };
            }
          );

        await sharp(
          Buffer.from(
            sceneCropped.data
          ),
          {
            raw: {
              width:
              sceneCropped.width,
              height:
              sceneCropped.height,
              channels:
                sceneCropped.channels as Channels
            }
          }
        )
          .composite(
            seatOverlay
          )
          .png()
          .toFile(
            seatDebugOutputPath
          );

        console.log(
          "SEAT LAYOUT DEBUG SAVED:",
          seatDebugOutputPath
        );

        /*
         * Keep the original table-only crop because
         * current card detection coordinates are
         * relative to this region.
         */
        const cropped =
          await cropFrame(
            frame,
            tableDetection.region,
            decoder
          );

        expect(cropped.width)
          .toBeGreaterThan(0);

        expect(cropped.height)
          .toBeGreaterThan(0);

        await sharp(
          Buffer.from(
            cropped.data
          ),
          {
            raw: {
              width:
              cropped.width,
              height:
              cropped.height,
              channels:
                cropped.channels as Channels
            }
          }
        )
          .png()
          .toFile(
            outputPath
          );

        console.log(
          "TABLE CROP SAVED:",
          outputPath
        );

        const cardDetector =
          new WhiteCardDetector({
            brightnessThreshold:
              0.6,
            minWhiteRatio:
              0.65,
            minWidth:
              20,
            minHeight:
              30,
            maxWidth:
              150,
            maxHeight:
              200,
            minAspectRatio:
              0.45,
            maxAspectRatio:
              0.85
          });

        const result =
          await cardDetector.detect(
            cropped
          );

        expect(result.found)
          .toBe(true);

        expect(result.regions)
          .toEqual([
            {
              x: 99,
              y: 286,
              width: 121,
              height: 53
            },
            {
              x: 1325,
              y: 286,
              width: 121,
              height: 53
            }
          ]);

        const debugOverlay =
          result.regions.map(
            (region) => ({
              input:
                Buffer.from(
                  `<svg
                    width="${region.width}"
                    height="${region.height}"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="1"
                      y="1"
                      width="${Math.max(
                    1,
                    region.width - 2
                  )}"
                      height="${Math.max(
                    1,
                    region.height - 2
                  )}"
                      fill="none"
                      stroke="red"
                      stroke-width="3"
                    />
                  </svg>`
                ),
              left:
              region.x,
              top:
              region.y
            })
          );

        await sharp(
          Buffer.from(
            cropped.data
          ),
          {
            raw: {
              width:
              cropped.width,
              height:
              cropped.height,
              channels:
                cropped.channels as Channels
            }
          }
        )
          .composite(
            debugOverlay
          )
          .png()
          .toFile(
            debugOutputPath
          );

        console.log(
          "CARD DEBUG SAVED:",
          debugOutputPath
        );

        console.log(
          "CARD DETECTION:",
          {
            table: {
              width:
              cropped.width,
              height:
              cropped.height
            },
            found:
            result.found,
            confidence:
            result.confidence,
            regions:
            result.regions
          }
        );

        expect(result.confidence)
          .toBeGreaterThan(0);
      }
    );
  }
);