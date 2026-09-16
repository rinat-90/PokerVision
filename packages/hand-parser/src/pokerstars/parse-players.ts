import type {
  HandHistoryPlayer
} from "@poker-vision/hand-history";

import {
  HandHistoryParserError
} from "../parser-error.js";

export interface PokerStarsPlayer
  extends Omit<
    HandHistoryPlayer,
    "position"
  > {
  seat: number;
}

export function parsePokerStarsPlayers(
  input: string
): PokerStarsPlayer[] {
  const lines =
    input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

  const players: PokerStarsPlayer[] = [];

  for (
    let index = 0;
    index < lines.length;
    index++
  ) {
    const line = lines[index];

    if (line === undefined) {
      continue;
    }

    const match =
      line.match(
        /^Seat\s+(\d+):\s+(.+?)\s+\(([\d.,]+)\s+in chips\)$/i
      );

    if (match === null) {
      continue;
    }

    const seatValue = match[1];
    const name = match[2];
    const stackValue = match[3];

    if (
      seatValue === undefined ||
      name === undefined ||
      stackValue === undefined
    ) {
      throw new HandHistoryParserError(
        "INVALID_PLAYER",
        `Unable to parse player on line ${index + 1}`,
        index + 1
      );
    }

    const seat =
      Number(seatValue);

    const startingStack =
      parseStack(stackValue);

    if (
      !Number.isInteger(seat) ||
      seat <= 0
    ) {
      throw new HandHistoryParserError(
        "INVALID_PLAYER",
        `Invalid seat number on line ${index + 1}`,
        index + 1
      );
    }

    if (
      !Number.isFinite(startingStack) ||
      startingStack < 0
    ) {
      throw new HandHistoryParserError(
        "INVALID_PLAYER",
        `Invalid player stack on line ${index + 1}`,
        index + 1
      );
    }

    players.push({
      id: `seat-${seat}`,
      name,
      seat,
      startingStack
    });
  }

  if (players.length === 0) {
    throw new HandHistoryParserError(
      "INVALID_PLAYER",
      "No PokerStars players found"
    );
  }

  return players;
}

function parseStack(
  value: string
): number {
  return Number(
    value.replace(/,/g, "")
  );
}