import type {
  PlayerAction
} from "../game-state/types.js";

import type {
  Street
} from "../types.js";

export type ActionRangeWeightAction =
  | PlayerAction["type"];

export interface ActionRangeWeightInput {
  action: ActionRangeWeightAction;
  street: Street;
}

export interface ActionRangeWeightModel {
  getMultiplier(
    input: ActionRangeWeightInput
  ): number;
}

export interface CreateActionRangeWeightModelOptions {
  multipliers?: Partial<
    Record<
      ActionRangeWeightAction,
      number
    >
  >;
}

const DEFAULT_MULTIPLIERS: Record<
  ActionRangeWeightAction,
  number
> = {
  fold: 0,
  check: 1,
  call: 1,
  bet: 1,
  raise: 1,
  all_in: 1
};

export function createActionRangeWeightModel(
  options: CreateActionRangeWeightModelOptions = {}
): ActionRangeWeightModel {
  const multipliers: Record<
    ActionRangeWeightAction,
    number
  > = {
    ...DEFAULT_MULTIPLIERS,
    ...options.multipliers
  };

  validateMultipliers(
    multipliers
  );

  return {
    getMultiplier(
      input: ActionRangeWeightInput
    ): number {
      return multipliers[input.action];
    }
  };
}

function validateMultipliers(
  multipliers: Record<
    ActionRangeWeightAction,
    number
  >
): void {
  for (
    const [action, multiplier]
    of Object.entries(multipliers)
    ) {
    if (
      !Number.isFinite(multiplier) ||
      multiplier < 0
    ) {
      throw new Error(
        `Range weight multiplier for ${action} must be a finite number greater than or equal to 0`
      );
    }
  }
}