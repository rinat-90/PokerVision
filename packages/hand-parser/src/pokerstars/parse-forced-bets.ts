import {
  HandHistoryParserError
} from "../parser-error.js";

export interface PokerStarsForcedBets {
  smallBlind: number;
  bigBlind: number;
  ante: number;
}

export function parsePokerStarsForcedBets(
  input: string
): PokerStarsForcedBets {
  const lines =
    input.split(/\r?\n/);

  let smallBlind:
    number | undefined;

  let bigBlind:
    number | undefined;

  let ante = 0;

  for (const rawLine of lines) {
    const line =
      rawLine.trim();

    if (line === "") {
      continue;
    }

    const smallBlindMatch =
      line.match(
        /^(.+?)\s+posts\s+small\s+blind\s+([\d.,]+)$/i
      );

    if (
      smallBlindMatch !== null &&
      smallBlindMatch[2] !== undefined
    ) {
      smallBlind =
        parseAmount(
          smallBlindMatch[2]
        );

      continue;
    }

    const bigBlindMatch =
      line.match(
        /^(.+?)\s+posts\s+big\s+blind\s+([\d.,]+)$/i
      );

    if (
      bigBlindMatch !== null &&
      bigBlindMatch[2] !== undefined
    ) {
      bigBlind =
        parseAmount(
          bigBlindMatch[2]
        );

      continue;
    }

    const anteMatch =
      line.match(
        /^(.+?)\s+posts\s+(?:the\s+)?ante\s+([\d.,]+)$/i
      );

    if (
      anteMatch !== null &&
      anteMatch[2] !== undefined
    ) {
      const parsedAnte =
        parseAmount(
          anteMatch[2]
        );

      if (ante === 0) {
        ante = parsedAnte;
      } else if (
        ante !== parsedAnte
      ) {
        throw new HandHistoryParserError(
          "INVALID_HEADER",
          "PokerStars hand contains inconsistent ante amounts"
        );
      }
    }
  }

  if (
    smallBlind === undefined ||
    bigBlind === undefined
  ) {
    throw new HandHistoryParserError(
      "INVALID_HEADER",
      "PokerStars blinds not found"
    );
  }

  return {
    smallBlind,
    bigBlind,
    ante
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
      "INVALID_HEADER",
      `Invalid forced bet amount: ${value}`
    );
  }

  return amount;
}