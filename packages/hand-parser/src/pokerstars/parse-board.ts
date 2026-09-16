import type {
  Card
} from "@poker-vision/poker-engine";

import {
  HandHistoryParserError
} from "../parser-error.js";

export interface PokerStarsBoard {
  street: "flop" | "turn" | "river";
  board: Card[];
}

const SUITS: Record<
  string,
  Card["suit"]
> = {
  c: "clubs",
  d: "diamonds",
  h: "hearts",
  s: "spades"
};

const VALID_RANKS =
  new Set<Card["rank"]>([
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "T",
    "J",
    "Q",
    "K",
    "A"
  ]);

export function parsePokerStarsBoard(
  input: string
): PokerStarsBoard[] {
  const lines =
    input.split(/\r?\n/);

  const boards: PokerStarsBoard[] = [];

  for (
    let index = 0;
    index < lines.length;
    index++
  ) {
    const line =
      lines[index]?.trim();

    if (
      line === undefined
    ) {
      continue;
    }

    const match =
      line.match(
        /^\*\*\*\s+(FLOP|TURN|RIVER)\s+\*\*\*\s+\[([^\]]+)\](?:\s+\[([^\]]+)\])?$/i
      );

    if (match === null) {
      continue;
    }

    const streetValue =
      match[1]?.toLowerCase();

    const firstCards =
      match[2];

    const secondCards =
      match[3];

    if (
      streetValue === undefined ||
      firstCards === undefined
    ) {
      throw new HandHistoryParserError(
        "INVALID_CARD",
        `Unable to parse board on line ${index + 1}`,
        index + 1
      );
    }

    if (
      streetValue !== "flop" &&
      streetValue !== "turn" &&
      streetValue !== "river"
    ) {
      throw new HandHistoryParserError(
        "INVALID_STREET",
        `Invalid PokerStars street on line ${index + 1}`,
        index + 1
      );
    }

    const firstBoard =
      parseCards(
        firstCards,
        index + 1
      );

    const secondBoard =
      secondCards === undefined
        ? []
        : parseCards(
          secondCards,
          index + 1
        );

    const board = [
      ...firstBoard,
      ...secondBoard
    ];

    const expectedCount =
      streetValue === "flop"
        ? 3
        : streetValue === "turn"
          ? 4
          : 5;

    if (
      board.length !==
      expectedCount
    ) {
      throw new HandHistoryParserError(
        "INVALID_CARD",
        `Expected ${expectedCount} board cards on ${streetValue}`,
        index + 1
      );
    }

    boards.push({
      street:
      streetValue,
      board
    });
  }

  return boards;
}

function parseCards(
  value: string,
  line: number
): Card[] {
  const tokens =
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  return tokens.map(
    (token) =>
      parseCard(
        token,
        line
      )
  );
}

function parseCard(
  value: string,
  line: number
): Card {
  if (
    value.length !== 2
  ) {
    throw new HandHistoryParserError(
      "INVALID_CARD",
      `Invalid card: ${value}`,
      line
    );
  }

  const rank =
    value[0]?.toUpperCase();

  const suitCode =
    value[1]?.toLowerCase();

  if (
    rank === undefined ||
    !VALID_RANKS.has(
      rank as Card["rank"]
    )
  ) {
    throw new HandHistoryParserError(
      "INVALID_CARD",
      `Invalid card rank: ${value}`,
      line
    );
  }

  const suit =
    suitCode === undefined
      ? undefined
      : SUITS[suitCode];

  if (suit === undefined) {
    throw new HandHistoryParserError(
      "INVALID_CARD",
      `Invalid card suit: ${value}`,
      line
    );
  }

  return {
    rank:
      rank as Card["rank"],
    suit
  };
}