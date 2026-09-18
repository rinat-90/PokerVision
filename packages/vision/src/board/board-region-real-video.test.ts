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
  cropFrame
} from "../table/crop-frame.js";

import {
  createBoardRegion
} from "./board-region.js";

import {
  BoardCardDetector
} from "./board-card-detector.js";

import {
  createBoardState
} from "./board-state.js";

import {
  BoardStateTracker
} from "./board-state-tracker.js";

import {
  detectBoardEvent,
  type BoardEvent
} from "./board-event-detector.js";

describe(
  "BoardCardDetector on real video",
  () => {
    it(
      "tracks stable community card street and events across a real poker hand",
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

        const decoder =
          new SharpImageDecoder();

        const tableDetector =
          new PurpleTableDetector(
            decoder
          );

        const boardCardDetector =
          new BoardCardDetector();

        const boardStateTracker =
          new BoardStateTracker({
            requiredStableFrames: 2
          });

        let previousStableState =
          createBoardState(0);

        const events: {
          timestampSeconds: number;
          event: BoardEvent;
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

          const boardRegion =
            createBoardRegion(
              tableDetection.region
            );

          const boardFrame =
            await cropFrame(
              frame,
              boardRegion,
              decoder
            );

          const detection =
            boardCardDetector.detect(
              boardFrame
            );

          const boardState =
            createBoardState(
              detection.count
            );

          const tracked =
            boardStateTracker.update(
              boardState
            );

          if (
            tracked.changed
          ) {
            const event =
              detectBoardEvent(
                previousStableState,
                tracked.state
              );

            if (event) {
              events.push({
                timestampSeconds:
                frame.timestampSeconds,
                event
              });
            }
          }

          previousStableState =
            tracked.state;

          console.log(
            `${frame.timestampSeconds.toFixed(2)}s`,
            {
              rawCount:
              detection.count,
              rawStreet:
              boardState.street,
              stableCount:
              tracked.state.cardCount,
              stableStreet:
              tracked.state.street,
              changed:
              tracked.changed
            }
          );
        }

        expect(
          events
        ).toEqual([
          {
            timestampSeconds:
              12,
            event: {
              type:
                "flopDealt",
              cardCount:
                3
            }
          },
          {
            timestampSeconds:
              22,
            event: {
              type:
                "turnDealt",
              cardCount:
                4
            }
          }
        ]);
      }
    );
  }
);