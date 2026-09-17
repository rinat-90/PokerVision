import type {
  Card,
  Street
} from "../types.js";

import type {
  Range
} from "../range/types.js";

import {
  narrowOpponentRange
} from "./range-narrowing.js";

import type {
  OpponentActionHistory
} from "./action-history.js";

import type {
  ActionRangeWeightModel
} from "./action-range-weight.js";

import {
  applyActionRangeWeights
} from "./apply-action-range-weights.js";

export interface BuildOpponentRangeInput {
  range: Range;
  actionHistory: OpponentActionHistory;
  board: Card[];
  knownCards?: Card[];
  street: Street;
  weightModel: ActionRangeWeightModel;
}

export interface BuildOpponentRangeResult {
  range: Range;
  originalComboCount: number;
  remainingComboCount: number;
  removedComboCount: number;
  originalWeight: number;
  resultingWeight: number;
}

export function buildOpponentRange(
  input: BuildOpponentRangeInput
): BuildOpponentRangeResult {
  const narrowed =
    narrowOpponentRange({
      range: input.range,
      actionHistory:
      input.actionHistory,
      board: input.board,
      ...(input.knownCards !== undefined
        ? {
          knownCards:
          input.knownCards
        }
        : {}),
      street: input.street
    });

  const weighted =
    applyActionRangeWeights({
      range:
      narrowed.range,
      actionHistory:
      input.actionHistory,
      model:
      input.weightModel
    });

  return {
    range:
    weighted.range,

    originalComboCount:
    narrowed.originalComboCount,

    remainingComboCount:
    narrowed.remainingComboCount,

    removedComboCount:
    narrowed.removedComboCount,

    originalWeight:
    weighted.originalWeight,

    resultingWeight:
    weighted.resultingWeight
  };
}