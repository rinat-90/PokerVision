import type {
  PlayerActionContext
} from "./player-action-context.js";

export type PlayerActionType =
  | "check"
  | "fold"
  | "call"
  | "bet"
  | "raise";

export interface PlayerActionClassification {
  type: PlayerActionType;
  amount: number | null;
}

export class PlayerActionClassifier {
  classify(
    context: PlayerActionContext
  ): PlayerActionClassification | null {
    const previousAmount =
      context.previousAmount ?? 0;

    const currentAmount =
      context.currentAmount;

    /*
     * No visible amount change gives us
     * insufficient evidence by itself.
     *
     * Check detection will eventually need
     * explicit action timing / turn context.
     */
    if (
      currentAmount === null ||
      currentAmount <= previousAmount
    ) {
      return null;
    }

    /*
     * Nobody has committed chips on this street.
     * First positive contribution is a bet.
     */
    if (
      context.highestAmount === 0
    ) {
      return {
        type: "bet",
        amount: currentAmount
      };
    }

    /*
     * Matching the current highest contribution
     * is a call.
     */
    if (
      currentAmount ===
      context.highestAmount
    ) {
      return {
        type: "call",
        amount:
          currentAmount -
          previousAmount
      };
    }

    /*
     * Going beyond the current highest
     * contribution is a raise.
     */
    if (
      currentAmount >
      context.highestAmount
    ) {
      return {
        type: "raise",
        amount:
          currentAmount -
          previousAmount
      };
    }

    return null;
  }
}