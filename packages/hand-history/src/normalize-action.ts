import type {
  HandHistoryAction
} from "./types.js";

export function normalizeActionAmount(
  action: HandHistoryAction,
  previousContribution: number
): number {
  if (previousContribution < 0) {
    throw new Error(
      "Previous contribution cannot be negative"
    );
  }

  if (action.amount < 0) {
    throw new Error(
      "Action amount cannot be negative"
    );
  }

  if (
    action.amountType === "contribution"
  ) {
    return action.amount;
  }

  return Math.max(
    0,
    action.amount - previousContribution
  );
}