import type { HandHistory } from "@poker-vision/hand-history";

import { parsePokerStarsHand } from "./parse-hand.js";

const HAND_START_PATTERN =
  /^PokerStars Hand #/gm;

export function parsePokerStarsHands(
  input: string
): HandHistory[] {
  const starts: number[] = [];

  for (
    const match of input.matchAll(
    HAND_START_PATTERN
  )
    ) {
    if (match.index !== undefined) {
      starts.push(match.index);
    }
  }

  if (starts.length === 0) {
    throw new Error(
      "No PokerStars hands found in input."
    );
  }

  const hands: HandHistory[] = [];

  for (
    let index = 0;
    index < starts.length;
    index += 1
  ) {
    const start = starts[index];

    if (start === undefined) {
      continue;
    }

    const nextStart =
      starts[index + 1];

    const handText =
      input.slice(
        start,
        nextStart
      ).trim();

    if (handText.length === 0) {
      continue;
    }

    hands.push(
      parsePokerStarsHand(
        handText
      )
    );
  }

  return hands;
}