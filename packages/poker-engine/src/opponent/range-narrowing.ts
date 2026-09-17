import type {
  Card,
  Street
} from "../types.js";

import type {
  Range,
  RangeCombo
} from "../range/types.js";

import type {
  OpponentActionHistory
} from "./action-history.js";

export interface NarrowOpponentRangeInput {
  range: Range;
  actionHistory: OpponentActionHistory;
  board: Card[];
  knownCards?: Card[];
  street: Street;
}

export interface NarrowOpponentRangeResult {
  range: Range;
  originalComboCount: number;
  remainingComboCount: number;
  removedComboCount: number;
}

export function narrowOpponentRange(
  input: NarrowOpponentRangeInput
): NarrowOpponentRangeResult {
  const {
    range,
    board,
    knownCards = []
  } = input;

  const unavailableCards = [
    ...board,
    ...knownCards
  ];

  const originalCombos =
    range.combos;

  const filteredCombos =
    originalCombos.filter(
      (combo) =>
        !comboContainsUnavailableCard(
          combo,
          unavailableCards
        )
    );

  const narrowedRange: Range = {
    combos:
    filteredCombos
  };

  return {
    range:
    narrowedRange,

    originalComboCount:
    originalCombos.length,

    remainingComboCount:
    filteredCombos.length,

    removedComboCount:
      originalCombos.length -
      filteredCombos.length
  };
}

function comboContainsUnavailableCard(
  combo: RangeCombo,
  unavailableCards: Card[]
): boolean {
  return (
    cardIsUnavailable(
      combo.cards[0],
      unavailableCards
    ) ||
    cardIsUnavailable(
      combo.cards[1],
      unavailableCards
    )
  );
}

function cardIsUnavailable(
  card: Card,
  unavailableCards: Card[]
): boolean {
  return unavailableCards.some(
    (unavailableCard) =>
      unavailableCard.rank === card.rank &&
      unavailableCard.suit === card.suit
  );
}