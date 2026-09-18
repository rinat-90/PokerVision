import type {
  BetAmountStateChange
} from "./bet-amount-state-tracker.js";

import type {
  PlayerContributionState
} from "./player-contribution-state.js";

import type {
  PlayerActionLabelEvent
} from "./player-action-label-event-detector.js";

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
  labelEvents?: PlayerActionLabelEvent[];
}

export class PlayerActionDetector {
  private readonly classifier =
    new PlayerActionClassifier();

  detect(
    input: PlayerActionDetectorInput
  ): PlayerActionEvent[] {
    const events: PlayerActionEvent[] =
      [];

    /*
     * Explicit UI labels are direct evidence
     * for check, fold, and call.
     *
     * placeBet is intentionally not emitted
     * here. It only tells us that the player is
     * placing chips. Bet vs raise still requires
     * amount/contribution context.
     */
    for (
      const labelEvent
      of input.labelEvents ?? []
      ) {
      if (
        labelEvent.label === "placeBet"
      ) {
        continue;
      }

      if (
        labelEvent.label === "check"
      ) {
        events.push({
          seatIndex:
          labelEvent.seatIndex,

          street:
          input.contributionState.street,

          type: "check",
          amount: null
        });

        continue;
      }

      if (
        labelEvent.label === "fold"
      ) {
        events.push({
          seatIndex:
          labelEvent.seatIndex,

          street:
          input.contributionState.street,

          type: "fold",
          amount: null
        });

        continue;
      }

      if (
        labelEvent.label === "call"
      ) {
        events.push({
          seatIndex:
          labelEvent.seatIndex,

          street:
          input.contributionState.street,

          type: "call",
          amount: null
        });
      }
    }

    /*
     * Stable amount transitions are used for
     * amount-based bet/call/raise detection.
     */
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

      /*
       * If the explicit label already emitted
       * the same semantic action for this seat,
       * do not emit a duplicate from the amount
       * transition.
       */
      const duplicate =
        events.some(
          event =>
            event.seatIndex ===
            change.seatIndex &&
            event.type ===
            classification.type
        );

      if (duplicate) {
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