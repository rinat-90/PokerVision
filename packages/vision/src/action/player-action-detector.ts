import type {
  BetAmountStateChange
} from "./bet-amount-state-tracker.js";

import type {
  PlayerContributionState
} from "./player-contribution-state.js";

import {
  createPlayerActionContext
} from "./player-action-context.js";

import {
  PlayerActionClassifier
} from "./player-action-classifier.js";

import type {
  PlayerActionClassification
} from "./player-action-classifier.js";

export interface PlayerActionEvent
  extends PlayerActionClassification {
  seatIndex: number;
  street: PlayerContributionState["street"];
}

export interface PlayerActionDetectorInput {
  contributionState: PlayerContributionState;
  changes: BetAmountStateChange[];
}

export class PlayerActionDetector {
  private readonly classifier =
    new PlayerActionClassifier();

  detect(
    input: PlayerActionDetectorInput
  ): PlayerActionEvent[] {
    const events: PlayerActionEvent[] =
      [];

    for (
      const change
      of input.changes
      ) {
      /*
       * Chips disappearing from the table is
       * not itself a poker action.
       */
      if (
        change.currentAmount === null
      ) {
        continue;
      }

      const playerContribution =
        input.contributionState
          .contributions
          .find(
            contribution =>
              contribution.seatIndex ===
              change.seatIndex
          );

      const previousAmount =
        playerContribution?.amount ??
        change.previousAmount ??
        0;

      const context =
        createPlayerActionContext({
          seatIndex:
          change.seatIndex,

          street:
          input.contributionState.street,

          previousAmount,

          currentAmount:
          change.currentAmount,

          highestAmount:
          input.contributionState
            .highestAmount,

          chipPresent: true
        });

      const classification =
        this.classifier.classify(
          context
        );

      if (!classification) {
        continue;
      }

      /*
       * Call and raise depend on knowing the
       * actual highest contribution on the table.
       *
       * An incomplete snapshot may be missing
       * OCR values from other seats, so these
       * classifications are not reliable.
       */
      if (
        !input.contributionState.complete &&
        (
          classification.type === "call" ||
          classification.type === "raise"
        )
      ) {
        continue;
      }

      events.push({
        seatIndex:
        change.seatIndex,

        street:
        input.contributionState.street,

        ...classification
      });
    }

    return events;
  }
}