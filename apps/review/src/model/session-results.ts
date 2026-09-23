import type {
  ReviewSession,
} from "./review-session";

import {
  createHandResult,
} from "./hand-result";

export interface SessionHandResult {
  handId: string;
  netResult: number;
  cumulativeNetResult: number;
}

export function createSessionResults(
  session: ReviewSession,
): SessionHandResult[] {
  let cumulativeNetResult = 0;

  const results: SessionHandResult[] = [];

  for (const hand of session.hands) {
    const result =
      createHandResult(hand);

    const heroResult =
      result?.players.find(
        (player) =>
          player.playerId ===
          hand.heroPlayerId,
      );

    if (heroResult === undefined) {
      continue;
    }

    cumulativeNetResult +=
      heroResult.netResult;

    results.push({
      handId: hand.id,

      netResult:
      heroResult.netResult,

      cumulativeNetResult,
    });
  }

  return results;
}