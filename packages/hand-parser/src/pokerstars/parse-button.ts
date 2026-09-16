import {
  HandHistoryParserError
} from "../parser-error.js";

export function parsePokerStarsButtonSeat(
  input: string
): number {
  const lines =
    input.split(/\r?\n/);

  const buttonLine =
    lines.find((line) =>
      /^Table .+ Seat #\d+ is the button$/i.test(
        line.trim()
      )
    );

  if (
    buttonLine === undefined
  ) {
    throw new HandHistoryParserError(
      "INVALID_HEADER",
      "PokerStars button seat not found"
    );
  }

  const match =
    buttonLine.match(
      /Seat #(\d+) is the button$/i
    );

  if (
    match === null ||
    match[1] === undefined
  ) {
    throw new HandHistoryParserError(
      "INVALID_HEADER",
      "Unable to parse PokerStars button seat"
    );
  }

  const seat =
    Number(match[1]);

  if (
    !Number.isInteger(seat) ||
    seat <= 0
  ) {
    throw new HandHistoryParserError(
      "INVALID_HEADER",
      "Invalid PokerStars button seat"
    );
  }

  return seat;
}