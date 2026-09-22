import type {
  SessionDecision,
} from "./session-decisions";

export interface DecisionComparisonDelta {
  expectedValue?: number;
  equity?: number;
  potOdds?: number;
  pot: number;
  callAmount: number;
}

function optionalDelta(
  left: number | undefined,
  right: number | undefined,
): number | undefined {
  if (
    left === undefined ||
    right === undefined
  ) {
    return undefined;
  }

  return right - left;
}

export function createDecisionComparisonDelta(
  left: SessionDecision,
  right: SessionDecision,
): DecisionComparisonDelta {
  return {
    expectedValue: optionalDelta(
      left.decision.expectedValue,
      right.decision.expectedValue,
    ),

    equity: optionalDelta(
      left.decision.equity,
      right.decision.equity,
    ),

    potOdds: optionalDelta(
      left.decision.potOdds,
      right.decision.potOdds,
    ),

    pot:
      right.decision.pot -
      left.decision.pot,

    callAmount:
      right.decision.callAmount -
      left.decision.callAmount,
  };
}