import type { Card } from "./types.js";
import { HandCategory } from "./hand-ranking.js";
import type { HandEvaluation } from "./evaluation.js";
import {
  getRankCounts,
  getSortedValues,
  getStraightHighCard,
  isFlush
} from "./detectors.js";

export function evaluateHand(
  cards: Card[]
): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error(
      `evaluateHand expects exactly 5 cards, received ${cards.length}`
    );
  }

  const values = getSortedValues(cards);
  const counts = getRankCounts(cards);

  const flush = isFlush(cards);
  const straightHigh = getStraightHighCard(cards);

  /*
   * Straight Flush
   */
  if (flush && straightHigh !== null) {
    return {
      category: HandCategory.STRAIGHT_FLUSH,
      score: [straightHigh],
      cards
    };
  }

  /*
   * Four of a Kind
   */
  const four = [...counts.entries()]
    .find(([, count]) => count === 4);

  if (four) {
    const [quadValue] = four;

    const kicker = values.find(
      (value) => value !== quadValue
    );

    return {
      category: HandCategory.FOUR_OF_A_KIND,
      score: [quadValue, kicker ?? 0],
      cards
    };
  }

  /*
   * Full House
   */
  const trips = [...counts.entries()]
    .find(([, count]) => count === 3);

  const pairs = [...counts.entries()]
    .filter(([, count]) => count === 2)
    .map(([value]) => value)
    .sort((a, b) => b - a);

  if (trips && pairs.length > 0) {
    return {
      category: HandCategory.FULL_HOUSE,
      score: [trips[0], pairs[0] ?? 0],
      cards
    };
  }

  /*
   * Flush
   */
  if (flush) {
    return {
      category: HandCategory.FLUSH,
      score: values,
      cards
    };
  }

  /*
   * Straight
   */
  if (straightHigh !== null) {
    return {
      category: HandCategory.STRAIGHT,
      score: [straightHigh],
      cards
    };
  }

  /*
   * Three of a Kind
   */
  if (trips) {
    const tripValue = trips[0];

    const kickers = values
      .filter((value) => value !== tripValue)
      .slice(0, 2);

    return {
      category: HandCategory.THREE_OF_A_KIND,
      score: [tripValue, ...kickers],
      cards
    };
  }

  /*
   * Two Pair
   */
  if (pairs.length >= 2) {
    const [highPair, lowPair] = pairs;

    const kicker = values.find(
      (value) =>
        value !== highPair &&
        value !== lowPair
    );

    return {
      category: HandCategory.TWO_PAIR,
      score: [
        highPair ?? 0,
        lowPair ?? 0,
        kicker ?? 0
      ],
      cards
    };
  }

  /*
   * One Pair
   */
  if (pairs.length === 1) {
    const pairValue = pairs[0];

    const kickers = values
      .filter((value) => value !== pairValue)
      .slice(0, 3);

    return {
      category: HandCategory.ONE_PAIR,
      score: [
        pairValue ?? 0,
        ...kickers
      ],
      cards
    };
  }

  /*
   * High Card
   */
  return {
    category: HandCategory.HIGH_CARD,
    score: values,
    cards
  };
}