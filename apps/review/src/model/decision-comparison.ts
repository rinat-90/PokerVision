import type {
  SessionDecision,
} from "./session-decisions";

export interface DecisionComparison {
  left?: SessionDecision;
  right?: SessionDecision;
}

export function createDecisionComparison(): DecisionComparison {
  return {};
}

export function selectComparisonDecision(
  comparison: DecisionComparison,
  decision: SessionDecision,
): DecisionComparison {
  if (
    comparison.left?.handId ===
    decision.handId &&
    comparison.left?.decision
      .actionIndex ===
    decision.decision.actionIndex
  ) {
    return {
      ...comparison,
      left: undefined,
    };
  }

  if (
    comparison.right?.handId ===
    decision.handId &&
    comparison.right?.decision
      .actionIndex ===
    decision.decision.actionIndex
  ) {
    return {
      ...comparison,
      right: undefined,
    };
  }

  if (comparison.left === undefined) {
    return {
      ...comparison,
      left: decision,
    };
  }

  if (comparison.right === undefined) {
    return {
      ...comparison,
      right: decision,
    };
  }

  return {
    left: comparison.right,
    right: decision,
  };
}

export function clearDecisionComparison(): DecisionComparison {
  return {};
}