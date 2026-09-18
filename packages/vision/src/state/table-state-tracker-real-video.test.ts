import {
  describe,
  expect,
  it
} from "vitest";

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
  createSixMaxSeatRegions
} from "../seat/seat-region.js";

import {
  SeatDetector
} from "../seat/seat-detector.js";

import {
  WhiteCardDetector
} from "../card/white-card-detector.js";

import {
  createTableState
} from "./table-state.js";

import {
  TableStateTracker
} from "./table-state-tracker.js";

describe(
  "TableStateTracker on real video",
  () => {
    it(
      "tracks seat card state across video frames",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        /*
         * Extract one frame per second across
         * a real poker hand.
         */
        const frames =
          await extractFrames(
            videoPath,
            {
              startSeconds: 0,
              endSeconds: 30,
              fps: 1
            }
          );

        expect(frames.length)
          .toBeGreaterThan(0);

        const decoder =
          new SharpImageDecoder();

        const tableDetector =
          new PurpleTableDetector(
            decoder
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

        const seatDetector =
          new SeatDetector(
            decoder,
            cardDetector
          );

        const tracker =
          new TableStateTracker({
            requiredStableFrames:
              2
          });

        const confirmedChanges: {
          timestampSeconds: number;
          seatIndexes: number[];
        }[] = [];

        for (
          const frame
          of frames
          ) {
          const tableDetection =
            await tableDetector.detect(
              frame
            );

          expect(
            tableDetection.found
          ).toBe(true);

          expect(
            tableDetection.region
          ).toBeDefined();

          if (
            !tableDetection.region
          ) {
            throw new Error(
              `Expected table region at ${frame.timestampSeconds}s`
            );
          }

          const seatRegions =
            createSixMaxSeatRegions(
              tableDetection.region,
              {
                width:
                frame.width,
                height:
                frame.height
              }
            );

          const detectedSeats =
            await seatDetector.detect(
              frame,
              seatRegions
            );

          const rawState =
            createTableState(
              detectedSeats
            );

          const tracked =
            tracker.update(
              rawState
            );

          if (
            tracked.changed
          ) {
            confirmedChanges.push({
              timestampSeconds:
              frame.timestampSeconds,
              seatIndexes:
                tracked.diff
                  .seatChanges
                  .map(
                    (change) =>
                      change.index
                  )
            });
          }

          const rawCards =
            rawState.seats.map(
              (seat) =>
                seat.hasCards
                  ? 1
                  : 0
            );

          const stableCards =
            tracked.state.seats.map(
              (seat) =>
                seat.hasCards
                  ? 1
                  : 0
            );

          console.log(
            `${frame.timestampSeconds.toFixed(2)}s`,
            {
              raw:
              rawCards,
              stable:
              stableCards,
              changed:
              tracked.changed,
              changes:
              tracked.diff
                .seatChanges
            }
          );

          expect(
            detectedSeats
          ).toHaveLength(6);

          expect(
            rawState.seats
          ).toHaveLength(6);

          expect(
            tracked.state.seats
          ).toHaveLength(6);
        }

        expect(
          confirmedChanges
        ).toEqual([
          {
            timestampSeconds:
              10,
            seatIndexes: [
              0,
              1
            ]
          },
          {
            timestampSeconds:
              22,
            seatIndexes: [
              2
            ]
          },
          {
            timestampSeconds:
              27,
            seatIndexes: [
              4,
              5
            ]
          }
        ]);
      }
    );
  }
);