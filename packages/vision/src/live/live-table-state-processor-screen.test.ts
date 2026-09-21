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
  TesseractBetAmountOcr
} from "../action/bet-amount-ocr.js";

import {
  BetAmountDetector
} from "../action/bet-amount-detector.js";

import {
  PlayerActionLabelRecognizer
} from "../action/player-action-label-recognizer.js";

import type {
  PokerStreet
} from "../action/player-action-context.js";

import {
  LiveTableStateProcessor
} from "./live-table-state-processor.js";

import {
  LiveBoardStateProcessor
} from "./live-board-state-processor.js";

import {
  LivePlayerActionProcessor
} from "./live-player-action-processor.js";

import {
  LiveHandTracker
} from "./live-hand-tracker.js";

describe(
  "LiveTableStateProcessor on live screen",
  () => {
    it(
      "processes live table state, board state, player actions and tracks hands",
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

        const tableProcessor =
          new LiveTableStateProcessor(
            tableDetector,
            seatDetector
          );

        const boardProcessor =
          new LiveBoardStateProcessor(
            tableDetector,
            decoder
          );

        const betAmountOcr =
          new TesseractBetAmountOcr();

        const amountDetector =
          new BetAmountDetector(
            betAmountOcr
          );

        const labelRecognizer =
          new PlayerActionLabelRecognizer();

        const actionProcessor =
          new LivePlayerActionProcessor(
            tableDetector,
            decoder,
            amountDetector,
            labelRecognizer
          );

        const handTracker =
          new LiveHandTracker();

        await source.start();

        let previousSeatState:
          string | null = null;

        let previousBoardState:
          string | null = null;

        let previousStreet:
          PokerStreet | null = null;

        let processedFrames = 0;
        let detectedStates = 0;
        let detectedBoardStates = 0;
        let detectedActions = 0;

        const observedBoardStreets =
          new Set<string>();

        const maxFrames = 60;

        try {
          for await (
            const frame of source
            ) {
            processedFrames++;

            const tableResult =
              await tableProcessor.process(
                frame
              );

            const handStarted =
              tableResult.lifecycleEvents.some(
                event =>
                  event.type ===
                  "handStarted"
              );

            if (handStarted) {
              boardProcessor.reset();
            }

            const boardResult =
              await boardProcessor.process(
                frame
              );

            /*
             * Board state is the source of truth
             * for the current poker street.
             *
             * Do not derive live streets from
             * fixture-specific timestamps.
             */
            const detectedStreet =
              boardResult.state
                ?.street;

            const street:
              PokerStreet =
              detectedStreet &&
              detectedStreet !== "unknown"
                ? detectedStreet
                : previousStreet ??
                "preflop";

            previousStreet =
              street;

            const actionResult =
              await actionProcessor.process(
                frame,
                street
              );

            /*
             * Update hand lifecycle first so a
             * handStarted event activates the
             * builder before actions from the same
             * frame are added.
             */
            const handResult =
              handTracker.update(
                tableResult
              );

            handTracker.updateActions(
              actionResult.timestampSeconds,
              actionResult.events
            );

            if (
              actionResult.events.length >
              0
            ) {
              detectedActions +=
                actionResult.events.length;

              for (
                const event
                of actionResult.events
                ) {
                console.log(
                  `${frame.timestampSeconds.toFixed(1)}s`,
                  "ACTION:",
                  `S${event.seatIndex}`,
                  event.street,
                  event.type,
                  event.amount
                );
              }
            }

            if (
              tableResult.state
            ) {
              detectedStates++;

              const seatState =
                tableResult.state.seats
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

            if (
              boardResult.state
            ) {
              detectedBoardStates++;

              const boardState =
                `${boardResult.state.street} ${
                  boardResult.state.cardCount
                }`;

              observedBoardStreets.add(
                boardResult.state.street
              );

              if (
                boardState !==
                previousBoardState
              ) {
                console.log(
                  `${frame.timestampSeconds.toFixed(1)}s`,
                  "BOARD:",
                  boardResult.state.street,
                  boardResult.state.cardCount,
                  boardResult.changed
                    ? "(changed)"
                    : ""
                );

                previousBoardState =
                  boardState;
              }
            }

            for (
              const event
              of tableResult.lifecycleEvents
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

              break;
            }

            if (
              processedFrames >=
              maxFrames
            ) {
              break;
            }
          }
        } finally {
          await source.stop();

          await betAmountOcr
            .terminate();

          await labelRecognizer
            .terminate();
        }

        console.log(
          "OBSERVED BOARD STREETS:",
          [
            ...observedBoardStreets
          ]
        );

        console.log(
          "DETECTED ACTIONS:",
          detectedActions
        );

        expect(
          processedFrames
        ).toBeGreaterThan(0);

        expect(
          detectedStates
        ).toBeGreaterThan(0);

        expect(
          detectedBoardStates
        ).toBeGreaterThan(0);

        expect(
          previousSeatState
        ).not.toBeNull();

        expect(
          previousBoardState
        ).not.toBeNull();
      },
      180_000
    );
  }
);
