import type {
  SourceFrame
} from "../source/frame-source.js";

import type {
  TableDetector
} from "../table/table-detector.js";

import {
  cropFrame
} from "../table/crop-frame.js";

import type {
  CroppedFrame
} from "../table/crop-frame.js";

import type {
  ImageDecoder
} from "../image/image-decoder.js";

import {
  createPlayerActionRegions
} from "../action/player-action-region.js";

import {
  createBetAmountRegions
} from "../action/bet-amount-region.js";

import {
  createSixMaxSeatRegions
} from "../seat/seat-region.js";

import {
  createPlayerActionLabelRegions
} from "../action/player-action-label-region.js";

import type {
  BetAmountDetection
} from "../action/bet-amount-detector.js";

import {
  BetAmountStateTracker
} from "../action/bet-amount-state-tracker.js";

import type {
  PlayerActionLabelRecognition
} from "../action/player-action-label-recognizer.js";

import {
  PlayerActionLabelEventDetector
} from "../action/player-action-label-event-detector.js";

import {
  PlayerActionDetector,
  type PlayerActionEvent
} from "../action/player-action-detector.js";

import {
  createPlayerContributionState
} from "../action/player-contribution-state.js";

import type {
  PokerStreet
} from "../action/player-action-context.js";

export interface LiveBetAmountDetector {
  detect(
    actionFrame: CroppedFrame,
    amountFrame: CroppedFrame,
    seatIndex: number
  ): Promise<BetAmountDetection>;
}

export interface LiveActionLabelRecognizer {
  recognize(
    frame: CroppedFrame
  ): Promise<PlayerActionLabelRecognition>;
}

export interface LivePlayerActionResult {
  timestampSeconds: number;
  street: PokerStreet;
  events: PlayerActionEvent[];
}

export interface LivePlayerActionProcessorOptions {
  contributionStateComplete?: boolean;
}

export class LivePlayerActionProcessor {
  private readonly amountTracker =
    new BetAmountStateTracker({
      requiredStableFrames: 2
    });

  private readonly labelEventDetector =
    new PlayerActionLabelEventDetector();

  private readonly actionDetector =
    new PlayerActionDetector();

  private contributionStateComplete:
    boolean;

  constructor(
    private readonly tableDetector:
    TableDetector,

    private readonly decoder:
    ImageDecoder,

    private readonly amountDetector:
    LiveBetAmountDetector,

    private readonly labelRecognizer:
    LiveActionLabelRecognizer,

    options:
    LivePlayerActionProcessorOptions = {}
  ) {
    this.contributionStateComplete =
      options.contributionStateComplete ??
      false;
  }

  async process(
    frame: SourceFrame,
    street: PokerStreet
  ): Promise<LivePlayerActionResult> {
    const tableDetection =
      await this.tableDetector.detect(
        frame
      );

    if (
      !tableDetection.found ||
      !tableDetection.region
    ) {
      return {
        timestampSeconds:
        frame.timestampSeconds,

        street,

        events: []
      };
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
          frame.width,

          height:
          frame.height
        }
      );

    const labelRegions =
      createPlayerActionLabelRegions(
        seatRegions
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
          this.decoder
        );

      const amountFrame =
        await cropFrame(
          frame,
          amountRegion,
          this.decoder
        );

      const detection =
        await this.amountDetector.detect(
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
      this.amountTracker.update(
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
          this.decoder
        );

      const recognition =
        await this.labelRecognizer.recognize(
          labelFrame
        );

      labelObservations.push({
        seatIndex:
        labelRegion.seatIndex,

        label:
        recognition.label
      });
    }

    const labelEvents =
      this.labelEventDetector.update(
        labelObservations
      );

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

    const contributionState =
      createPlayerContributionState(
        street,
        contributions,
        this.contributionStateComplete
      );

    const events =
      this.actionDetector.detect({
        contributionState,
        changes:
        tracked.changes,
        labelEvents
      });

    return {
      timestampSeconds:
      frame.timestampSeconds,

      street,

      events
    };
  }

  markContributionStateComplete(): void {
    this.contributionStateComplete =
      true;
  }
}