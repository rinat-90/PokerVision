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
  createBetAmountRegions
} from "./bet-amount-region.js";

import {
  TesseractBetAmountOcr
} from "./bet-amount-ocr.js";

import {
  BetAmountDetector
} from "./bet-amount-detector.js";

import {
  BetAmountStateTracker
} from "./bet-amount-state-tracker.js";

import {
  createPlayerContributionState
} from "./player-contribution-state.js";

import {
  PlayerActionDetector
} from "./player-action-detector.js";

import {
  createPlayerActionLabelRegions
} from "./player-action-label-region.js";

import {
  PlayerActionLabelRecognizer
} from "./player-action-label-recognizer.js";

import {
  PlayerActionLabelEventDetector
} from "./player-action-label-event-detector.js";

import {
  createSixMaxSeatRegions
} from "../seat/seat-region.js";

import type {
  PokerStreet
} from "./player-action-context.js";

function getStreet(
  timestampSeconds: number
): PokerStreet {
  if (
    timestampSeconds >= 22
  ) {
    return "turn";
  }

  if (
    timestampSeconds >= 12
  ) {
    return "flop";
  }

  return "preflop";
}

describe(
  "PlayerActionDetector on real video",
  () => {
    it(
      "combines stable bet amounts and explicit action labels",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const startSeconds = 0;

        const frames =
          await extractFrames(
            videoPath,
            {
              startSeconds,
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

        const actionRegions =
          createPlayerActionRegions(
            tableDetection.region
          );

        const amountRegions =
          createBetAmountRegions(
            actionRegions
          );

        const seatRegions =
          createSixMaxSeatRegions(
            tableDetection.region,
            {
              width:
              firstFrame.width,

              height:
              firstFrame.height
            }
          );

        const labelRegions =
          createPlayerActionLabelRegions(
            seatRegions
          );

        const ocr =
          new TesseractBetAmountOcr();

        const amountDetector =
          new BetAmountDetector(
            ocr
          );

        const amountTracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        const labelRecognizer =
          new PlayerActionLabelRecognizer();

        const labelEventDetector =
          new PlayerActionLabelEventDetector();

        const actionDetector =
          new PlayerActionDetector();

        const actions: Array<{
          timestampSeconds: number;
          seatIndex: number;
          street: PokerStreet;
          type: string;
          amount: number | null;
        }> = [];

        try {
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

            const timestampSeconds =
              startSeconds +
              frameIndex;

            const street =
              getStreet(
                timestampSeconds
              );

            const amountStates = [];

            for (
              const actionRegion
              of actionRegions
              ) {
              const amountRegion =
                amountRegions.find(
                  region =>
                    region.seatIndex ===
                    actionRegion.seatIndex
                );

              if (!amountRegion) {
                throw new Error(
                  `Expected amount region for seat ${actionRegion.seatIndex}`
                );
              }

              const actionFrame =
                await cropFrame(
                  frame,
                  actionRegion,
                  decoder
                );

              const amountFrame =
                await cropFrame(
                  frame,
                  amountRegion,
                  decoder
                );

              const detection =
                await amountDetector.detect(
                  actionFrame,
                  amountFrame,
                  actionRegion.seatIndex
                );

              amountStates.push({
                seatIndex:
                detection.seatIndex,

                amount:
                  detection.chipPresent
                    ? detection.amount
                    : null,

                rawText:
                  detection.chipPresent
                    ? detection.rawText
                    : null,

                confidence:
                detection.confidence
              });
            }

            const tracked =
              amountTracker.update(
                amountStates
              );

            const labelObservations = [];

            for (
              const labelRegion
              of labelRegions
              ) {
              const labelFrame =
                await cropFrame(
                  frame,
                  labelRegion,
                  decoder
                );

              const recognition =
                await labelRecognizer.recognize(
                  labelFrame
                );

              if (
                (
                  timestampSeconds === 9 ||
                  timestampSeconds === 12 ||
                  timestampSeconds === 18 ||
                  timestampSeconds === 21
                ) &&
                (
                  recognition.label !== null ||
                  recognition.rawText !== null
                )
              ) {
                console.log(
                  `${timestampSeconds}s LABEL S${labelRegion.seatIndex}`,
                  {
                    label:
                    recognition.label,

                    rawText:
                    recognition.rawText,

                    confidence:
                    recognition.confidence,

                    matchingPixelRatio:
                    recognition.matchingPixelRatio
                  }
                );
              }

              labelObservations.push({
                seatIndex:
                labelRegion.seatIndex,

                label:
                recognition.label
              });
            }

            const labelEvents =
              labelEventDetector.update(
                labelObservations
              );

            if (labelEvents.length > 0) {
              console.log(
                `${timestampSeconds}s LABEL EVENTS:`,
                labelEvents
              );
            }

            /*
             * Build the contribution snapshot from
             * the stable state before this frame's
             * amount transitions are applied.
             */
            const contributions =
              tracked.stable
                .map(
                  state => {
                    const change =
                      tracked.changes.find(
                        candidate =>
                          candidate.seatIndex ===
                          state.seatIndex
                      );

                    const amount =
                      change
                        ? change.previousAmount
                        : state.amount;

                    if (
                      amount === null
                    ) {
                      return null;
                    }

                    return {
                      seatIndex:
                      state.seatIndex,

                      amount
                    };
                  }
                )
                .filter(
                  (
                    contribution
                  ): contribution is {
                    seatIndex: number;
                    amount: number;
                  } =>
                    contribution !== null
                );

            /*
             * The recording begins mid-preflop,
             * so the initial contribution snapshot
             * is incomplete.
             *
             * Postflop starts from a known cleared
             * contribution state in this fixture.
             */
            const contributionState =
              createPlayerContributionState(
                street,
                contributions,
                street !== "preflop"
              );

            const events =
              actionDetector.detect({
                contributionState,
                changes:
                tracked.changes,
                labelEvents
              });

            for (
              const event
              of events
              ) {
              actions.push({
                timestampSeconds,

                seatIndex:
                event.seatIndex,

                street:
                event.street,

                type:
                event.type,

                amount:
                event.amount
              });

              console.log(
                `${timestampSeconds}s S${event.seatIndex} ${event.type} ${event.amount ?? ""}`
              );
            }
          }
        } finally {
          await ocr.terminate();
          await labelRecognizer.terminate();
        }

        console.log(
          "PLAYER ACTIONS:",
          actions
        );

        expect(
          actions
        ).toEqual([
          {
            timestampSeconds: 9,
            seatIndex: 1,
            street: "preflop",
            type: "fold",
            amount: null
          },
          {
            timestampSeconds: 9,
            seatIndex: 5,
            street: "preflop",
            type: "call",
            amount: null
          },
          {
            timestampSeconds: 12,
            seatIndex: 2,
            street: "flop",
            type: "check",
            amount: null
          },
          {
            timestampSeconds: 20,
            seatIndex: 4,
            street: "flop",
            type: "bet",
            amount: 1900
          },
          {
            timestampSeconds: 21,
            seatIndex: 2,
            street: "flop",
            type: "fold",
            amount: null
          },
          {
            timestampSeconds: 21,
            seatIndex: 5,
            street: "flop",
            type: "call",
            amount: null
          },
          {
            timestampSeconds: 25,
            seatIndex: 4,
            street: "turn",
            type: "bet",
            amount: 5700
          }
        ]);
      }
    );
  }
);