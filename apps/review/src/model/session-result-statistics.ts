import type {
  SessionHandResult,
} from "./session-results";

export interface SessionResultStatistics {
  totalHands: number;
  wins: number;
  losses: number;
  breakEven: number;
  winRate: number;
  averageResult: number;
  biggestWin: number | null;
  biggestLoss: number | null;
}

export function createSessionResultStatistics(
  results: SessionHandResult[],
): SessionResultStatistics {
  if (results.length === 0) {
    return {
      totalHands: 0,
      wins: 0,
      losses: 0,
      breakEven: 0,
      winRate: 0,
      averageResult: 0,
      biggestWin: null,
      biggestLoss: null,
    };
  }

  let wins = 0;
  let losses = 0;
  let breakEven = 0;
  let totalNetResult = 0;

  let biggestWin: number | null =
    null;

  let biggestLoss: number | null =
    null;

  for (const result of results) {
    const netResult =
      result.netResult;

    totalNetResult += netResult;

    if (netResult > 0) {
      wins += 1;

      biggestWin =
        biggestWin === null
          ? netResult
          : Math.max(
            biggestWin,
            netResult,
          );

      continue;
    }

    if (netResult < 0) {
      losses += 1;

      biggestLoss =
        biggestLoss === null
          ? netResult
          : Math.min(
            biggestLoss,
            netResult,
          );

      continue;
    }

    breakEven += 1;
  }

  return {
    totalHands: results.length,
    wins,
    losses,
    breakEven,

    winRate:
      (wins / results.length) *
      100,

    averageResult:
      totalNetResult /
      results.length,

    biggestWin,
    biggestLoss,
  };
}