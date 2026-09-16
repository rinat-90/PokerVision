import type { Card } from "../types.js";
import { createDeck } from "../deck.js";
import { getBestHand } from "../best-hand.js";
import { compareHands } from "../compare-hands.js";

export interface SimulationResult {
  wins: number;
  losses: number;
  ties: number;
  total: number;
  equity: number;
}

export interface SimulationOptions {
  heroCards: Card[];
  villainCards: Card[];
  board: Card[];
  iterations?: number;
}

export function simulateEquity(
  options: SimulationOptions
): SimulationResult {
  const {
    heroCards,
    villainCards,
    board,
    iterations = 10_000
  } = options;

  validateInput(heroCards, villainCards, board);

  const knownCards = [
    ...heroCards,
    ...villainCards,
    ...board
  ];

  const deck = createDeck().filter(
    (card) => !containsCard(knownCards, card)
  );

  const cardsToDeal = 5 - board.length;

  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (let i = 0; i < iterations; i++) {
    const remaining = shuffle(deck);

    const runout = remaining.slice(
      0,
      cardsToDeal
    );

    const finalBoard = [
      ...board,
      ...runout
    ];

    const heroHand = getBestHand([
      ...heroCards,
      ...finalBoard
    ]);

    const villainHand = getBestHand([
      ...villainCards,
      ...finalBoard
    ]);

    const comparison = compareHands(
      heroHand,
      villainHand
    );

    if (comparison > 0) {
      wins++;
    } else if (comparison < 0) {
      losses++;
    } else {
      ties++;
    }
  }

  const total = wins + losses + ties;

  const equity =
    total === 0
      ? 0
      : (wins + ties * 0.5) / total;

  return {
    wins,
    losses,
    ties,
    total,
    equity
  };
}

function containsCard(
  cards: Card[],
  target: Card
): boolean {
  return cards.some(
    (card) =>
      card.rank === target.rank &&
      card.suit === target.suit
  );
}

function shuffle(cards: Card[]): Card[] {
  const result = [...cards];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() * (i + 1)
    );

    [
      result[i],
      result[j]
    ] = [
      result[j]!,
      result[i]!
    ];
  }

  return result;
}

function validateInput(
  heroCards: Card[],
  villainCards: Card[],
  board: Card[]
): void {
  if (heroCards.length !== 2) {
    throw new Error(
      "Hero must have exactly 2 cards"
    );
  }

  if (villainCards.length !== 2) {
    throw new Error(
      "Villain must have exactly 2 cards"
    );
  }

  if (board.length > 5) {
    throw new Error(
      "Board cannot contain more than 5 cards"
    );
  }

  const allCards = [
    ...heroCards,
    ...villainCards,
    ...board
  ];

  const uniqueCards = new Set(
    allCards.map(
      (card) => `${card.rank}-${card.suit}`
    )
  );

  if (uniqueCards.size !== allCards.length) {
    throw new Error(
      "Duplicate cards detected"
    );
  }
}