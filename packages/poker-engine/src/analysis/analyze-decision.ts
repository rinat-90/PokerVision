import type {
  DecisionAnalysisInput,
  DecisionAnalysisResult,
} from "./decision-analysis.js";

import { analyzeHand } from "./analyze-hand.js";

export function analyzeDecision(
  input: DecisionAnalysisInput,
): DecisionAnalysisResult {
  if (input.action === "call") {
    if (input.callAmount === undefined) {
      throw new Error(
        "callAmount is required when analyzing a call decision",
      );
    }

    const result =
      analyzeHand({
        heroCards: input.heroCards,
        villainRange: input.villainRange,
        board: input.board,
        pot: input.pot,
        callAmount: input.callAmount,
        ...(input.iterationsPerCombo !== undefined
          ? {
            iterationsPerCombo:
            input.iterationsPerCombo
          }
          : {})
      });

    return {
      action: result.action,
      equity: result.equity,
      expectedValue: result.expectedValue.ev,
      potOdds: result.potOdds.requiredEquity,
      decision: result.decision,
      validVillainCombos: result.validVillainCombos,
    };
  }

  return {
    action: input.action,
    equity: 0,
    decision: "not_applicable",
    validVillainCombos: 0,
  };
}