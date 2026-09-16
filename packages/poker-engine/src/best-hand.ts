import type { Card } from "./types.js";
import type { HandEvaluation } from "./evaluation.js";
import { evaluateHand } from "./evaluate-hand.js";

export function getBestHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5 || cards.length > 7) {
    throw new Error(
      `getBestHand expects between 5 and 7 cards, received ${cards.length}`
    );
  }

  const combinations = getFiveCardCombinations(cards);

  let bestEvaluation: HandEvaluation | null = null;

  for (const combination of combinations) {
    const evaluation = evaluateHand(combination);

    if (
      bestEvaluation === null ||
      compareEvaluations(evaluation, bestEvaluation) > 0
    ) {
      bestEvaluation = evaluation;
    }
  }

  if (bestEvaluation === null) {
    throw new Error("Unable to evaluate hand");
  }

  return bestEvaluation;
}

function getFiveCardCombinations(cards: Card[]): Card[][] {
  const combinations: Card[][] = [];

  for (let a = 0; a < cards.length - 4; a++) {
    for (let b = a + 1; b < cards.length - 3; b++) {
      for (let c = b + 1; c < cards.length - 2; c++) {
        for (let d = c + 1; d < cards.length - 1; d++) {
          for (let e = d + 1; e < cards.length; e++) {
            combinations.push([
              cards[a]!,
              cards[b]!,
              cards[c]!,
              cards[d]!,
              cards[e]!
            ]);
          }
        }
      }
    }
  }

  return combinations;
}

function compareEvaluations(
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