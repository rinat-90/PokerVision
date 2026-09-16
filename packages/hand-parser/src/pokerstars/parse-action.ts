import type {
  ActionType,
  Street
} from "@poker-vision/poker-engine";

import type {
  HandHistoryAction
} from "@poker-vision/hand-history";

import {
  HandHistoryParserError
} from "../parser-error.js";

export interface PokerStarsActionContext {
  street: Street;
  playerId: string;
  playerName: string;
  currentStreetContribution: number;
}

export function parsePokerStarsAction(
  line: string,
  context: PokerStarsActionContext
): HandHistoryAction {
  const normalized =
    line.trim();

  if (
    normalized === ""
  ) {
    throw new HandHistoryParserError(
      "INVALID_ACTION",
      "Action line cannot be empty"
    );
  }

  const prefix =
    `${context.playerName}: `;

  if (
    !normalized.startsWith(prefix)
  ) {
    throw new HandHistoryParserError(
      "INVALID_ACTION",
      `Action does not belong to player ${context.playerName}`
    );
  }

  const actionText =
    normalized.slice(
      prefix.length
    );

  // --------------------------------
  // FOLD
  // --------------------------------

  if (
    /^folds$/i.test(
      actionText
    )
  ) {
    return createAction(
      context,
      "fold",
      0
    );
  }

  // --------------------------------
  // CHECK
  // --------------------------------

  if (
    /^checks$/i.test(
      actionText
    )
  ) {
    return createAction(
      context,
      "check",
      0
    );
  }

  // --------------------------------
  // CALL
  // --------------------------------
  //
  // PokerStars:
  //
  //   Villain: calls 6
  //
  // means the player contributes 6
  // chips with this action.
  //
  // It is NOT a "total contribution"
  // like "raises X to Y".
  //
  // Therefore:
  //
  //   calls 6 -> amount 6
  //
  // even if the player already has
  // chips committed on this street.

  const callMatch =
    actionText.match(
      /^calls\s+([\d.,]+)(?:\s+and\s+is\s+all-in)?$/i
    );

  if (
    callMatch !== null &&
    callMatch[1] !== undefined
  ) {
    const amount =
      parseAmount(
        callMatch[1]
      );

    return createAction(
      context,
      "call",
      amount
    );
  }

  // --------------------------------
  // BET
  // --------------------------------

  const betMatch =
    actionText.match(
      /^bets\s+([\d.,]+)(?:\s+and\s+is\s+all-in)?$/i
    );

  if (
    betMatch !== null &&
    betMatch[1] !== undefined
  ) {
    return createAction(
      context,
      "bet",
      parseAmount(
        betMatch[1]
      )
    );
  }

  // --------------------------------
  // RAISE TO
  // --------------------------------
  //
  // PokerStars:
  //
  //   Hero: raises 2 to 6
  //
  // "6" is the player's total
  // contribution for the street.
  //
  // If Hero already contributed 2:
  //
  //   6 - 2 = 4
  //
  // Therefore normalized amount = 4.

  const raiseToMatch =
    actionText.match(
      /^raises\s+([\d.,]+)\s+to\s+([\d.,]+)(?:\s+and\s+is\s+all-in)?$/i
    );

  if (
    raiseToMatch !== null &&
    raiseToMatch[2] !== undefined
  ) {
    const totalAmount =
      parseAmount(
        raiseToMatch[2]
      );

    const contribution =
      totalAmount -
      context.currentStreetContribution;

    if (
      contribution < 0
    ) {
      throw new HandHistoryParserError(
        "INVALID_ACTION",
        `Raise amount is smaller than current contribution for ${context.playerName}`
      );
    }

    return createAction(
      context,
      "raise",
      contribution
    );
  }

  // --------------------------------
  // EXPLICIT ALL-IN
  // --------------------------------
  //
  // Example:
  //
  //   Hero: is all-in for 100
  //
  // This is already a contribution
  // amount.

  const allInMatch =
    actionText.match(
      /^is all-in(?:\s+for\s+([\d.,]+))?$/i
    );

  if (
    allInMatch !== null
  ) {
    const amount =
      allInMatch[1] !== undefined
        ? parseAmount(
          allInMatch[1]
        )
        : 0;

    return createAction(
      context,
      "all_in",
      amount
    );
  }

  // --------------------------------
  // UNKNOWN ACTION
  // --------------------------------

  throw new HandHistoryParserError(
    "INVALID_ACTION",
    `Unable to parse PokerStars action: ${actionText}`
  );
}

function createAction(
  context: PokerStarsActionContext,
  type: ActionType,
  amount: number
): HandHistoryAction {
  return {
    playerId:
    context.playerId,
    type,
    amount,
    amountType:
      "contribution",
    street:
    context.street
  };
}

function parseAmount(
  value: string
): number {
  const amount =
    Number(
      value.replace(/,/g, "")
    );

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new HandHistoryParserError(
      "INVALID_ACTION",
      `Invalid action amount: ${value}`
    );
  }

  return amount;
}