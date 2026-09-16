import type {
  HandHistoryAction,
  HandHistoryStreet
} from "@poker-vision/hand-history";

import type {
  Card,
  Street
} from "@poker-vision/poker-engine";

import {
  HandHistoryParserError
} from "../parser-error.js";

export function parsePokerStarsStreets(
  input: string,
  actions: HandHistoryAction[]
): HandHistoryStreet[] {
  const lines =
    input.split(/\r?\n/);

  const markers: Array<{
    street: Street;
    board: Card[];
  }> = [];

  for (const rawLine of lines) {
    const line =
      rawLine.trim();

    if (line === "") {
      continue;
    }

    const marker =
      parseStreetMarker(line);

    if (marker !== null) {
      markers.push(marker);
    }
  }

  const streets: HandHistoryStreet[] = [];

  const hasPreflopMarker =
    markers.some(
      (marker) =>
        marker.street === "preflop"
    );

  if (
    actions.some(
      (action) =>
        action.street === "preflop"
    ) &&
    !hasPreflopMarker
  ) {
    streets.push({
      street: "preflop",
      board: [],
      actions: actions.filter(
        (action) =>
          action.street ===
          "preflop"
      )
    });
  }

  for (const marker of markers) {
    streets.push({
      street: marker.street,
      board: marker.board,
      actions: actions.filter(
        (action) =>
          action.street ===
          marker.street
      )
    });
  }

  if (
    streets.length === 0
  ) {
    streets.push({
      street: "preflop",
      board: [],
      actions: actions.filter(
        (action) =>
          action.street ===
          "preflop"
      )
    });
  }

  return streets;
}

function parseStreetMarker(
  line: string
): {
  street: Street;
  board: Card[];
} | null {
  if (
    /^\*\*\*\s+HOLE CARDS\s+\*\*\*$/i.test(
      line
    )
  ) {
    return {
      street: "preflop",
      board: []
    };
  }

  const flopMatch =
    line.match(
      /^\*\*\*\s+FLOP\s+\*\*\*\s+\[([^\]]+)\]$/i
    );

  if (
    flopMatch !== null &&
    flopMatch[1] !== undefined
  ) {
    return {
      street: "flop",
      board: parseCards(
        flopMatch[1]
      )
    };
  }

  const turnMatch =
    line.match(
      /^\*\*\*\s+TURN\s+\*\*\*\s+\[([^\]]+)\]\s+\[([^\]]+)\]$/i
    );

  if (
    turnMatch !== null &&
    turnMatch[1] !== undefined &&
    turnMatch[2] !== undefined
  ) {
    return {
      street: "turn",
      board: [
        ...parseCards(
          turnMatch[1]
        ),
        ...parseCards(
          turnMatch[2]
        )
      ]
    };
  }

  const riverMatch =
    line.match(
      /^\*\*\*\s+RIVER\s+\*\*\*\s+\[([^\]]+)\]\s+\[([^\]]+)\]$/i
    );

  if (
    riverMatch !== null &&
    riverMatch[1] !== undefined &&
    riverMatch[2] !== undefined
  ) {
    return {
      street: "river",
      board: [
        ...parseCards(
          riverMatch[1]
        ),
        ...parseCards(
          riverMatch[2]
        )
      ]
    };
  }

  return null;
}

function parseCards(
  value: string
): Card[] {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) =>
      parseCard(token)
    );
}

function parseCard(
  value: string
): Card {
  if (
    value.length !== 2
  ) {
    throw new HandHistoryParserError(
      "INVALID_CARD",
      `Invalid card: ${value}`
    );
  }

  const rank =
    value[0]?.toUpperCase();

  const suitCode =
    value[1]?.toLowerCase();

  const suits: Record<
    string,
    Card["suit"]
  > = {
    c: "clubs",
    d: "diamonds",
    h: "hearts",
    s: "spades"
  };

  const validRanks =
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

  if (
    rank === undefined ||
    !validRanks.has(
      rank as Card["rank"]
    )
  ) {
    throw new HandHistoryParserError(
      "INVALID_CARD",
      `Invalid card rank: ${value}`
    );
  }

  const suit =
    suitCode === undefined
      ? undefined
      : suits[suitCode];

  if (suit === undefined) {
    throw new HandHistoryParserError(
      "INVALID_CARD",
      `Invalid card suit: ${value}`
    );
  }

  return {
    rank:
      rank as Card["rank"],
    suit
  };
}