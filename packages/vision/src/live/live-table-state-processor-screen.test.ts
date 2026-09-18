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

describe(
  "LiveTableStateProcessor on live screen",
  () => {
    it(
      "detects a live hand boundary",
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

        await source.start();

        let previousSeatState:
          string | null = null;

        let sawHandEnded = false;
        let sawHandStarted = false;

        const maxFrames = 90;

        try {
          for await (
            const frame of source
            ) {
            const result =
              await processor.process(
                frame
              );

            if (result.state) {
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

              if (
                event.type ===
                "handEnded"
              ) {
                sawHandEnded = true;
              }

              if (
                sawHandEnded &&
                event.type ===
                "handStarted"
              ) {
                sawHandStarted = true;
              }
            }

            if (
              sawHandEnded &&
              sawHandStarted
            ) {
              break;
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
          sawHandEnded
        ).toBe(true);

        expect(
          sawHandStarted
        ).toBe(true);
      },
      55_000
    );
  }
);