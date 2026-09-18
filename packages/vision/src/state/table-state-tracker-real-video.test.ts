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

import {
  detectTableEvents
} from "./table-event-detector.js";

import {
  HandLifecycleDetector
} from "./hand-lifecycle-detector.js";

describe(
  "TableStateTracker on real video",
  () => {
    it(
      "detects stable card and hand lifecycle events across video frames",
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

        const lifecycleDetector =
          new HandLifecycleDetector();

        const detectedEvents: {
          timestampSeconds: number;
          type:
            | "cardsAppeared"
            | "cardsDisappeared";
          seatIndex: number;
        }[] = [];

        const lifecycleEvents: {
          timestampSeconds: number;
          type:
            | "handStarted"
            | "handEnded";
          activeSeatIndexes: number[];
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

          const events =
            detectTableEvents(
              tracked.diff
            );

          for (
            const event
            of events
            ) {
            detectedEvents.push({
              timestampSeconds:
              frame.timestampSeconds,
              type:
              event.type,
              seatIndex:
              event.seatIndex
            });
          }

          const handEvents =
            lifecycleDetector.update(
              tracked.state
            );

          for (
            const event
            of handEvents
            ) {
            lifecycleEvents.push({
              timestampSeconds:
              frame.timestampSeconds,
              type:
              event.type,
              activeSeatIndexes:
              event.activeSeatIndexes
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
                .seatChanges,
              events,
              handEvents
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
          detectedEvents
        ).toEqual([
          {
            timestampSeconds:
              10,
            type:
              "cardsDisappeared",
            seatIndex:
              0
          },
          {
            timestampSeconds:
              10,
            type:
              "cardsDisappeared",
            seatIndex:
              1
          },
          {
            timestampSeconds:
              22,
            type:
              "cardsDisappeared",
            seatIndex:
              2
          },
          {
            timestampSeconds:
              27,
            type:
              "cardsDisappeared",
            seatIndex:
              4
          },
          {
            timestampSeconds:
              27,
            type:
              "cardsDisappeared",
            seatIndex:
              5
          }
        ]);

        expect(
          lifecycleEvents
        ).toEqual([
          {
            timestampSeconds:
              27,
            type:
              "handEnded",
            activeSeatIndexes:
              []
          }
        ]);
      }
    );
  }
);