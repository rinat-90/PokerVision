import type {
  HandHistoryPlayer
} from "@poker-vision/hand-history";

import {
  HandHistoryParserError
} from "../parser-error.js";

export type PokerStarsForcedBetType =
  | "small_blind"
  | "big_blind"
  | "ante";

export interface PokerStarsForcedBetAction {
  playerId: string;
  type: PokerStarsForcedBetType;
  amount: number;
}

export function parsePokerStarsForcedBetActions(
  input: string,
  players: HandHistoryPlayer[]
): PokerStarsForcedBetAction[] {
  const lines =
    input.split(/\r?\n/);

  const playerByName =
    new Map(
      players.map(
        (player) => [
          player.name,
          player
        ]
      )
    );

  const actions: PokerStarsForcedBetAction[] =
    [];

  for (const rawLine of lines) {
    const line =
      rawLine.trim();

    if (line === "") {
      continue;
    }

    const smallBlindMatch =
      line.match(
        /^(.+?):\s+posts\s+small\s+blind\s+([\d.,]+)$/i
      );

    if (
      smallBlindMatch !== null &&
      smallBlindMatch[1] !== undefined &&
      smallBlindMatch[2] !== undefined
    ) {
      actions.push(
        createForcedBetAction(
          playerByName,
          smallBlindMatch[1],
          "small_blind",
          smallBlindMatch[2]
        )
      );

      continue;
    }

    const bigBlindMatch =
      line.match(
        /^(.+?):\s+posts\s+big\s+blind\s+([\d.,]+)$/i
      );

    if (
      bigBlindMatch !== null &&
      bigBlindMatch[1] !== undefined &&
      bigBlindMatch[2] !== undefined
    ) {
      actions.push(
        createForcedBetAction(
          playerByName,
          bigBlindMatch[1],
          "big_blind",
          bigBlindMatch[2]
        )
      );

      continue;
    }

    const anteMatch =
      line.match(
        /^(.+?):\s+posts\s+(?:the\s+)?ante\s+([\d.,]+)$/i
      );

    if (
      anteMatch !== null &&
      anteMatch[1] !== undefined &&
      anteMatch[2] !== undefined
    ) {
      actions.push(
        createForcedBetAction(
          playerByName,
          anteMatch[1],
          "ante",
          anteMatch[2]
        )
      );
    }
  }

  return actions;
}

function createForcedBetAction(
  playerByName: Map<
    string,
    HandHistoryPlayer
  >,
  playerName: string,
  type: PokerStarsForcedBetType,
  amountValue: string
): PokerStarsForcedBetAction {
  const player =
    playerByName.get(
      playerName
    );

  if (player === undefined) {
    throw new HandHistoryParserError(
      "INVALID_PLAYER",
      `Unable to find player for forced bet: ${playerName}`
    );
  }

  const amount =
    Number(
      amountValue.replace(/,/g, "")
    );

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    throw new HandHistoryParserError(
      "INVALID_ACTION",
      `Invalid forced bet amount: ${amountValue}`
    );
  }

  return {
    playerId:
    player.id,
    type,
    amount
  };
}