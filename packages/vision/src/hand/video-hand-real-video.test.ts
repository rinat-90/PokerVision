import {
  describe,
  expect,
  it
} from "vitest";

import {
  fileURLToPath
} from "node:url";

import {
  extractFrames,
  type VideoFrame
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
} from "../state/table-state.js";

import {
  TableStateTracker
} from "../state/table-state-tracker.js";

import {
  HandLifecycleDetector
} from "../state/hand-lifecycle-detector.js";

import {
  createBoardRegion
} from "../board/board-region.js";

import {
  BoardCardRecognizer
} from "../board/board-card-recognizer.js";

import {
  RecognizedBoardEventDetector
} from "../board/recognized-board-event-detector.js";

import {
  RankRecognizer
} from "../card/rank-recognizer.js";

import {
  SuitRecognizer
} from "../card/suit-recognizer.js";

import {
  CardRecognizer
} from "../card/card-recognizer.js";

import {
  CardSymbolExtractor,
  type ExtractedCardSymbols
} from "../card/card-symbol-extractor.js";

import {
  BoardCardDetector
} from "../board/board-card-detector.js";

import {
  VideoHandBuilder
} from "./video-hand-builder.js";

describe(
  "VideoHand on real video",
  () => {
    it(
      "reconstructs a poker hand from video",
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

        expect(
          frames.length
        ).toBeGreaterThan(0);

        const decoder =
          new SharpImageDecoder();

        const tableDetector =
          new PurpleTableDetector(
            decoder
          );

        const holeCardDetector =
          new WhiteCardDetector({
            brightnessThreshold: 0.6,
            minWhiteRatio: 0.65,
            minWidth: 20,
            minHeight: 30,
            maxWidth: 150,
            maxHeight: 200,
            minAspectRatio: 0.45,
            maxAspectRatio: 0.85
          });

        const seatDetector =
          new SeatDetector(
            decoder,
            holeCardDetector
          );

        const tableStateTracker =
          new TableStateTracker({
            requiredStableFrames: 2
          });

        const lifecycleDetector =
          new HandLifecycleDetector();

        /*
         * Build recognition templates
         * from known calibration frames.
         */
        const extractFrameAt =
          async (
            timestampSeconds: number
          ): Promise<VideoFrame> => {
            const extracted =
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
              extracted[0];

            if (!frame) {
              throw new Error(
                `Expected frame at ${timestampSeconds}s`
              );
            }

            return frame;
          };

        const flopFrame =
          await extractFrameAt(
            11
          );

        const turnFrame =
          await extractFrameAt(
            21
          );

        const boardDetector =
          new BoardCardDetector();

        const symbolExtractor =
          new CardSymbolExtractor(
            decoder
          );

        const extractSymbols =
          async (
            frame: VideoFrame,
            expectedCount: number
          ): Promise<
            ExtractedCardSymbols[]
          > => {
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
              boardDetector.detect(
                boardFrame
              );

            expect(
              detection.regions
            ).toHaveLength(
              expectedCount
            );

            return Promise.all(
              detection.regions.map(
                (region) =>
                  symbolExtractor.extract(
                    frame,
                    boardRegion,
                    region
                  )
              )
            );
          };

        const flopSymbols =
          await extractSymbols(
            flopFrame,
            3
          );

        const turnSymbols =
          await extractSymbols(
            turnFrame,
            4
          );

        const rank2 =
          flopSymbols[0];

        const rank6 =
          flopSymbols[1];

        const rank5 =
          flopSymbols[2];

        const club5 =
          turnSymbols[3];

        if (
          !rank2 ||
          !rank6 ||
          !rank5 ||
          !club5
        ) {
          throw new Error(
            "Expected calibration card symbols"
          );
        }

        const rankRecognizer =
          new RankRecognizer(
            [
              {
                rank: "2",
                mask: rank2.rank
              },
              {
                rank: "6",
                mask: rank6.rank
              },
              {
                rank: "5",
                mask: rank5.rank
              }
            ],
            {
              minimumConfidence:
                0.9
            }
          );

        const suitRecognizer =
          new SuitRecognizer(
            [
              {
                suit: "hearts",
                mask: rank2.suit
              },
              {
                suit: "clubs",
                mask: club5.suit
              }
            ],
            {
              minimumConfidence:
                0.8
            }
          );

        const cardRecognizer =
          new CardRecognizer(
            rankRecognizer,
            suitRecognizer
          );

        const boardRecognizer =
          new BoardCardRecognizer(
            decoder,
            cardRecognizer,
            boardDetector
          );

        const boardEventDetector =
          new RecognizedBoardEventDetector({
            requiredStableFrames: 2
          });

        const handBuilder =
          new VideoHandBuilder();

        let handInitialized =
          false;

        let completedHand:
          ReturnType<
            VideoHandBuilder[
              "complete"
              ]
          > | null = null;

        for (
          const frame
          of frames
          ) {
          const tableDetection =
            await tableDetector.detect(
              frame
            );

          if (
            !tableDetection.region
          ) {
            throw new Error(
              `Expected table region at ${frame.timestampSeconds}s`
            );
          }

          /*
           * Seat / hand lifecycle.
           */
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

          const trackedState =
            tableStateTracker.update(
              createTableState(
                detectedSeats
              )
            );

          const lifecycleEvents =
            lifecycleDetector.update(
              trackedState.state
            );

          /*
           * The video may begin while a hand
           * is already in progress. In that
           * case the lifecycle detector does
           * not emit handStarted for its
           * initial state, so initialize a
           * partial hand from the active seats.
           */
          if (
            !handInitialized
          ) {
            const activeSeatIndexes =
              trackedState.state.seats
                .filter(
                  (seat) =>
                    seat.hasCards
                )
                .map(
                  (seat) =>
                    seat.index
                );

            if (
              activeSeatIndexes.length >= 2
            ) {
              handBuilder.startPartial(
                activeSeatIndexes.map(
                  (seatIndex) => ({
                    seatIndex,
                    hasCards: true
                  })
                )
              );

              handInitialized =
                true;
            }
          }

          for (
            const event
            of lifecycleEvents
            ) {
            if (
              event.type ===
              "handStarted"
            ) {
              handBuilder.start(
                frame.timestampSeconds,
                event.activeSeatIndexes.map(
                  (seatIndex) => ({
                    seatIndex,
                    hasCards: true
                  })
                )
              );

              handInitialized =
                true;
            }

            if (
              event.type ===
              "handEnded"
            ) {
              completedHand =
                handBuilder.complete(
                  frame.timestampSeconds
                );

              handInitialized =
                false;
            }
          }

          /*
           * Community card recognition.
           */
          const boardRegion =
            createBoardRegion(
              tableDetection.region
            );

          const boardResult =
            await boardRecognizer.recognize(
              frame,
              boardRegion
            );

          const recognizedCards =
            boardResult.cards.flatMap(
              ({
                 recognition
               }) =>
                recognition.card
                  ? [
                    recognition.card
                  ]
                  : []
            );

          const boardUpdate =
            boardEventDetector.update(
              boardResult.cards.length,
              recognizedCards
            );

          if (
            boardUpdate.event
          ) {
            handBuilder.addBoardEvent(
              frame.timestampSeconds,
              boardUpdate.event
            );
          }
        }

        expect(
          completedHand
        ).not.toBeNull();

        if (
          !completedHand
        ) {
          throw new Error(
            "Expected completed video hand"
          );
        }

        console.log(
          "VIDEO HAND:",
          JSON.stringify(
            completedHand,
            null,
            2
          )
        );

        expect(
          completedHand.startedAt
        ).toBeNull();

        expect(
          completedHand.players.map(
            (player) =>
              player.seatIndex
          )
        ).toEqual([
          0,
          1,
          2,
          4,
          5
        ]);

        expect(
          completedHand.streets.map(
            (street) => ({
              street:
              street.street,
              timestampSeconds:
              street.timestampSeconds,
              board:
                street.board.map(
                  (card) => ({
                    rank:
                    card.rank,
                    suit:
                    card.suit
                  })
                )
            })
          )
        ).toEqual([
          {
            street: "flop",
            timestampSeconds: 12,
            board: [
              {
                rank: "2",
                suit: "hearts"
              },
              {
                rank: "6",
                suit: "hearts"
              },
              {
                rank: "5",
                suit: "hearts"
              }
            ]
          },
          {
            street: "turn",
            timestampSeconds: 22,
            board: [
              {
                rank: "2",
                suit: "hearts"
              },
              {
                rank: "6",
                suit: "hearts"
              },
              {
                rank: "5",
                suit: "hearts"
              },
              {
                rank: "5",
                suit: "clubs"
              }
            ]
          }
        ]);

        expect(
          completedHand.completedAt
        ).toBe(27);
      }
    );
  }
);