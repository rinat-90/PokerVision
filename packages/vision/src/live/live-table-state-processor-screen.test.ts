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
} from "../table/purple-table-detector.js";

import {
  WhiteCardDetector
} from "../card/white-card-detector.js";

import {
  SeatDetector
} from "../seat/seat-detector.js";

import {
  LiveTableStateProcessor
} from "./live-table-state-processor.js";

import {
  LiveHandTracker
} from "./live-hand-tracker.js";

describe(
  "LiveTableStateProcessor on live screen",
  () => {
    it(
      "processes live table state and tracks hands",
      async () => {
        const source =
          new ScreenFrameSource();

        const decoder =
          new SharpImageDecoder();

        const tableDetector =
          new PurpleTableDetector(
            decoder,
            {
              minPixelRatio: 0.01
            }
          );

        const seatDetector =
          new SeatDetector(
            decoder,
            new WhiteCardDetector()
          );

        const processor =
          new LiveTableStateProcessor(
            tableDetector,
            seatDetector
          );

        const handTracker =
          new LiveHandTracker();

        await source.start();

        let previousSeatState:
          string | null = null;

        let processedFrames = 0;
        let detectedStates = 0;

        const maxFrames = 60;

        try {
          for await (
            const frame of source
            ) {
            processedFrames++;

            const result =
              await processor.process(
                frame
              );

            const handResult =
              handTracker.update(
                result
              );

            if (result.state) {
              detectedStates++;

              const seatState =
                result.state.seats
                  .map(
                    seat =>
                      `${seat.index}:${
                        seat.hasCards
                          ? "1"
                          : "0"
                      }`
                  )
                  .join(" ");

              if (
                seatState !==
                previousSeatState
              ) {
                console.log(
                  `${frame.timestampSeconds.toFixed(1)}s`,
                  "STATE:",
                  seatState
                );

                previousSeatState =
                  seatState;
              }
            }

            for (
              const event
              of result.lifecycleEvents
              ) {
              console.log(
                `${frame.timestampSeconds.toFixed(1)}s`,
                "LIFECYCLE:",
                event.type,
                event.activeSeatIndexes
              );
            }

            if (
              handResult.completedHand
            ) {
              console.log(
                `${frame.timestampSeconds.toFixed(1)}s`,
                "COMPLETED HAND:",
                handResult.completedHand
              );

              expect(
                handResult.completedHand
                  .completedAt
              ).toBe(
                frame.timestampSeconds
              );

              expect(
                handResult.completedHand
                  .players.length
              ).toBeGreaterThanOrEqual(
                2
              );

              expect(
                handResult.completedHand
                  .streets
              ).toEqual([]);

              expect(
                handResult.completedHand
                  .actions
              ).toEqual([]);
            }

            if (
              frame.index >=
              maxFrames - 1
            ) {
              break;
            }
          }
        } finally {
          await source.stop();
        }

        expect(
          processedFrames
        ).toBeGreaterThan(0);

        expect(
          detectedStates
        ).toBeGreaterThan(0);

        expect(
          previousSeatState
        ).not.toBeNull();
      },
      40_000
    );
  }
);