import type {
  GameFormat
} from "@poker-vision/poker-engine";

import {
  HandHistoryParserError
} from "../parser-error.js";

export interface PokerStarsHeader {
  id: string;
  gameFormat: GameFormat;
  smallBlind: number;
  bigBlind: number;
}

export function parsePokerStarsHeader(
  input: string
): PokerStarsHeader {
  const lines =
    input
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

  const headerLine =
    lines.find((line) =>
      /^PokerStars Hand #/i.test(
        line
      )
    );

  if (
    headerLine === undefined
  ) {
    throw new HandHistoryParserError(
      "INVALID_HEADER",
      "PokerStars hand header not found"
    );
  }

  const handMatch =
    headerLine.match(
      /^PokerStars Hand #(\d+)/i
    );

  if (
    handMatch === null ||
    handMatch[1] === undefined
  ) {
    throw new HandHistoryParserError(
      "INVALID_HEADER",
      "Unable to parse PokerStars hand id"
    );
  }

  const id =
    handMatch[1];

  const cashGameMatch =
    headerLine.match(
      /\(\$?([\d.]+)\/\$?([\d.]+)\s*(?:USD)?\)/i
    );

  if (
    cashGameMatch !== null &&
    cashGameMatch[1] !== undefined &&
    cashGameMatch[2] !== undefined
  ) {
    return {
      id,
      gameFormat: "cash",
      smallBlind:
        Number(cashGameMatch[1]),
      bigBlind:
        Number(cashGameMatch[2])
    };
  }

  const tournamentMatch =
    headerLine.match(
      /(?:Tournament|Freeroll|Play Money)/i
    );

  if (
    tournamentMatch !== null
  ) {
    return {
      id,
      gameFormat: "tournament",
      smallBlind: 0,
      bigBlind: 0
    };
  }

  throw new HandHistoryParserError(
    "INVALID_HEADER",
    "Unable to determine PokerStars game format or blinds"
  );
}