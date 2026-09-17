import type {
  Range,
  RangeCombo
} from "../range/types.js";

import type {
  OpponentActionHistory
} from "./action-history.js";

import type {
  ActionRangeWeightModel
} from "./action-range-weight.js";

export interface ApplyActionRangeWeightsInput {
  range: Range;
  actionHistory: OpponentActionHistory;
  model: ActionRangeWeightModel;
}

export interface ApplyActionRangeWeightsResult {
  range: Range;
  originalWeight: number;
  resultingWeight: number;
}

export function applyActionRangeWeights(
  input: ApplyActionRangeWeightsInput
): ApplyActionRangeWeightsResult {
  const {
    range,
    actionHistory,
    model
  } = input;

  const originalWeight =
    getTotalWeight(range.combos);

  const multipliers =
    actionHistory.actions.map(
      (action) =>
        model.getMultiplier({
          action: action.type,
          street: action.street
        })
    );

  const combinedMultiplier =
    multipliers.reduce(
      (product, multiplier) =>
        product * multiplier,
      1
    );

  const weightedCombos =
    range.combos.map(
      (combo): RangeCombo => ({
        cards: combo.cards,
        weight:
          combo.weight *
          combinedMultiplier
      })
    );

  const resultingWeight =
    getTotalWeight(weightedCombos);

  return {
    range: {
      combos:
      weightedCombos
    },
    originalWeight,
    resultingWeight
  };
}

function getTotalWeight(
  combos: RangeCombo[]
): number {
  return combos.reduce(
    (total, combo) =>
      total + combo.weight,
    0
  );
}