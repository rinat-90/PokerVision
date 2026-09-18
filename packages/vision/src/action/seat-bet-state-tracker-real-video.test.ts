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
  cropFrame
} from "../table/crop-frame.js";

import {
  PurpleTableDetector
} from "../table/purple-table-detector.js";

import {
  createPlayerActionRegions
} from "./player-action-region.js";

import {
  BetChipDetector
} from "./bet-chip-detector.js";

import {
  createBetEvent,
  type BetEvent
} from "./bet-event-detector.js";

import {
  SeatBetStateTracker
} from "./seat-bet-state-tracker.js";

interface TimestampedBetEvent {
  timestampSeconds: number;
  event: BetEvent;
}

describe(
  "SeatBetStateTracker on real video",
  () => {
    it(
      "emits stable bet events independently per seat",
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
              startSeconds: 0,
              endSeconds: 30,
              fps: 1
            }
          );

        const firstFrame =
          frames[0];

        if (!firstFrame) {
          throw new Error(
            "Expected video frames"
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
            firstFrame
          );

        if (!tableDetection.region) {
          throw new Error(
            "Expected table region"
          );
        }

        const regions =
          createPlayerActionRegions(
            tableDetection.region
          );

        const detector =
          new BetChipDetector();

        const trackers =
          new Map(
            regions.map(
              (region) => [
                region.seatIndex,
                new SeatBetStateTracker()
              ]
            )
          );

        const events:
          TimestampedBetEvent[] =
          [];

        for (
          let frameIndex = 0;
          frameIndex < frames.length;
          frameIndex += 1
        ) {
          const frame =
            frames[frameIndex];

          if (!frame) {
            continue;
          }

          for (
            const region of regions
            ) {
            const cropped =
              await cropFrame(
                frame,
                region,
                decoder
              );

            const detection =
              detector.detect(
                cropped
              );

            const tracker =
              trackers.get(
                region.seatIndex
              );

            if (!tracker) {
              throw new Error(
                `Missing tracker for seat ${region.seatIndex}`
              );
            }

            const tracked =
              tracker.update(
                detection.present
              );

            if (!tracked.changed) {
              continue;
            }

            events.push({
              timestampSeconds:
              frameIndex,
              event:
                createBetEvent(
                  region.seatIndex,
                  tracked.hasBet
                )
            });
          }
        }

        expect(
          events
        ).toEqual([
          {
            timestampSeconds: 8,
            event: {
              type: "betAppeared",
              seatIndex: 4
            }
          },
          {
            timestampSeconds: 9,
            event: {
              type: "betAppeared",
              seatIndex: 5
            }
          },
          {
            timestampSeconds: 12,
            event: {
              type: "betCleared",
              seatIndex: 1
            }
          },
          {
            timestampSeconds: 12,
            event: {
              type: "betCleared",
              seatIndex: 2
            }
          },
          {
            timestampSeconds: 12,
            event: {
              type: "betCleared",
              seatIndex: 5
            }
          },
          {
            timestampSeconds: 13,
            event: {
              type: "betCleared",
              seatIndex: 4
            }
          },
          {
            timestampSeconds: 20,
            event: {
              type: "betAppeared",
              seatIndex: 4
            }
          },
          {
            timestampSeconds: 23,
            event: {
              type: "betCleared",
              seatIndex: 4
            }
          },
          {
            timestampSeconds: 25,
            event: {
              type: "betAppeared",
              seatIndex: 4
            }
          },
          {
            timestampSeconds: 27,
            event: {
              type: "betCleared",
              seatIndex: 4
            }
          }
        ]);
      }
    );
  }
);