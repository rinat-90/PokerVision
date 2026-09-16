import type {
  HandHistoryFormat
} from "../types.js";

export function detectHandHistoryFormat(
  input: string
): HandHistoryFormat {
  const normalized =
    input.trim();

  if (
    normalized === ""
  ) {
    return "unknown";
  }

  if (
    /PokerStars Hand #/i.test(
      normalized
    )
  ) {
    return "pokerstars";
  }

  if (
    /GGPoker Hand #/i.test(
      normalized
    ) ||
    /GGPoker/i.test(
      normalized
    )
  ) {
    return "ggpoker";
  }

  if (
    /PartyPoker/i.test(
      normalized
    )
  ) {
    return "partypoker";
  }

  return "unknown";
}