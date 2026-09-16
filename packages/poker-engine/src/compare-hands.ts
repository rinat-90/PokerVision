import type { HandEvaluation } from "./evaluation.js";

export function compareHands(
  a: HandEvaluation,
  b: HandEvaluation
): number {
  if (a.category !== b.category) {
    return a.category - b.category;
  }

  const maxLength = Math.max(
    a.score.length,
    b.score.length
  );

  for (let i = 0; i < maxLength; i++) {
    const aScore = a.score[i] ?? 0;
    const bScore = b.score[i] ?? 0;

    if (aScore !== bScore) {
      return aScore - bScore;
    }
  }

  return 0;
}