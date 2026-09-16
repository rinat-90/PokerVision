import type {
  Card
} from "@poker-vision/poker-engine";

import {
  HandHistoryParserError
} from "../parser-error.js";

export interface PokerStarsHoleCards {
  playerName: string;
  holeCards: [Card, Card];
}

const RANKS =
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

const SUITS: Record<
  string,
  Card["suit"]
> = {
  c: "clubs",
  d: "diamonds",
  h: "hearts",
  s: "spades"
};

export function parsePokerStarsHoleCards(
  input: string
): PokerStarsHoleCards[] {
  const lines =
    input.split(/\r?\n/);

  const holeCards: PokerStarsHoleCards[] =
    [];

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
        /^Dealt to (.+?) \[([2-9TJQKA][cdhs]) ([2-9TJQKA][cdhs])\]$/i
      );

    if (match === null) {
      continue;
    }

    const playerName =
      match[1];

    const firstCard =
      match[2];

    const secondCard =
      match[3];

    if (
      playerName === undefined ||
      firstCard === undefined ||
      secondCard === undefined
    ) {
      throw new HandHistoryParserError(
        "INVALID_CARD",
        `Unable to parse hole cards on line ${index + 1}`,
        index + 1
      );
    }

    holeCards.push({
      playerName,
      holeCards: [
        parseCard(
          firstCard,
          index + 1
        ),
        parseCard(
          secondCard,
          index + 1
        )
      ]
    });
  }

  return holeCards;
}

function parseCard(
  value: string,
  line: number
): Card {
  const rankValue =
    value[0]?.toUpperCase();

  const suitValue =
    value[1]?.toLowerCase();

  if (
    rankValue === undefined ||
    !RANKS.has(
      rankValue as Card["rank"]
    )
  ) {
    throw new HandHistoryParserError(
      "INVALID_CARD",
      `Invalid card rank: ${value}`,
      line
    );
  }

  const suit =
    suitValue === undefined
      ? undefined
      : SUITS[suitValue];

  if (suit === undefined) {
    throw new HandHistoryParserError(
      "INVALID_CARD",
      `Invalid card suit: ${value}`,
      line
    );
  }

  return {
    rank:
      rankValue as Card["rank"],
    suit
  };
}