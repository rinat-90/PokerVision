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
      "detects reliable player actions from stable bet amount transitions",
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

        const actionDetector =
          new PlayerActionDetector();

        const actionCandidates: Array<{
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

            const states = [];

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

              states.push({
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
                states
              );

            /*
             * Build the contribution snapshot from
             * the stable state BEFORE processing
             * this frame's transitions.
             *
             * For seats that changed on this frame,
             * use previousAmount so the classifier
             * sees the state before the action.
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
 * Preflop recording starts with existing chips
 * already on the table and OCR does not recognize
 * every visible amount, so that snapshot is
 * incomplete.
 *
 * Postflop streets begin from a known cleared
 * contribution state in this fixture.
 */
            const contributionState =
              createPlayerContributionState(
                street,
                contributions,
                street !== "preflop"
              );

            if (
              tracked.changes.length > 0
            ) {
              console.log(
                `${timestampSeconds}s ${street}`,
                "snapshot=",
                contributions,
                "changes=",
                tracked.changes
              );
            }

            const events =
              actionDetector.detect({
                contributionState,
                changes:
                tracked.changes
              });

            for (
              const event
              of events
              ) {
              actionCandidates.push({
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
                `  ACTION CANDIDATE: S${event.seatIndex} ${event.type} ${event.amount ?? ""}`
              );
            }
          }
        } finally {
          await ocr.terminate();
        }

        console.log(
          "ACTION CANDIDATES:",
          actionCandidates
        );

        /*
         * Diagnostic validation for now.
         * After seeing the real output we'll
         * replace this with semantic assertions.
         */
        expect(
          actionCandidates
        ).toEqual([
          {
            timestampSeconds: 20,
            seatIndex: 4,
            street: "flop",
            type: "bet",
            amount: 1900
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