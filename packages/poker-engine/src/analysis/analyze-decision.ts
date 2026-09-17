import type {
  DecisionAnalysisInput,
  DecisionAnalysisResult,
} from "./decision-analysis.js";

import {
  analyzeHand
} from "./analyze-hand.js";

import {
  analyzeBet
} from "./analyze-bet.js";

import {
  analyzeRaise
} from "./analyze-raise.js";

import {
  analyzeAllIn
} from "./analyze-all-in.js";

import {
  analyzeCheck
} from "./analyze-check.js";

import {
  calculateRangeEquity
} from "../equity/range-equity.js";

export function analyzeDecision(
  input: DecisionAnalysisInput,
): DecisionAnalysisResult {
  if (input.action === "check") {
    const result =
      analyzeCheck();

    const equityResult =
      calculateRangeEquity({
        heroCards:
        input.heroCards,

        villainRange:
        input.villainRange,

        board:
        input.board,

        ...(input.iterationsPerCombo !== undefined
          ? {
            iterationsPerCombo:
            input.iterationsPerCombo
          }
          : {})
      });

    return {
      action: result.action,
      equity:
      equityResult.equity,
      expectedValue:
      result.expectedValue,
      decision:
      result.decision,
      validVillainCombos:
      equityResult.combos
    };
  }

  if (input.action === "all_in") {
    if (input.allInAmount === undefined) {
      throw new Error(
        "allInAmount is required when analyzing an all-in decision",
      );
    }

    if (input.opponentCallAmount === undefined) {
      throw new Error(
        "opponentCallAmount is required when analyzing an all-in decision",
      );
    }

    if (input.foldProbability === undefined) {
      throw new Error(
        "foldProbability is required when analyzing an all-in decision",
      );
    }

    const equityResult =
      calculateRangeEquity({
        heroCards:
        input.heroCards,

        villainRange:
        input.villainRange,

        board:
        input.board,

        ...(input.iterationsPerCombo !== undefined
          ? {
            iterationsPerCombo:
            input.iterationsPerCombo
          }
          : {})
      });

    const result =
      analyzeAllIn({
        equity:
        equityResult.equity,

        pot:
        input.pot,

        allInAmount:
        input.allInAmount,

        opponentCallAmount:
        input.opponentCallAmount,

        foldProbability:
        input.foldProbability
      });

    const decision =
      getDecision(
        result.expectedValue
      );

    return {
      action: "all_in",
      equity:
      result.equity,
      expectedValue:
      result.expectedValue,
      decision,
      validVillainCombos:
      equityResult.combos
    };
  }

  if (input.action === "call") {
    if (input.callAmount === undefined) {
      throw new Error(
        "callAmount is required when analyzing a call decision",
      );
    }

    const result =
      analyzeHand({
        heroCards:
        input.heroCards,

        villainRange:
        input.villainRange,

        board:
        input.board,

        pot:
        input.pot,

        callAmount:
        input.callAmount,

        ...(input.iterationsPerCombo !== undefined
          ? {
            iterationsPerCombo:
            input.iterationsPerCombo
          }
          : {})
      });

    return {
      action:
      result.action,

      equity:
      result.equity,

      expectedValue:
      result.expectedValue.ev,

      potOdds:
      result.potOdds.requiredEquity,

      decision:
      result.decision,

      validVillainCombos:
      result.validVillainCombos,
    };
  }

  if (input.action === "bet") {
    if (input.betAmount === undefined) {
      throw new Error(
        "betAmount is required when analyzing a bet decision",
      );
    }

    if (input.foldProbability === undefined) {
      throw new Error(
        "foldProbability is required when analyzing a bet decision",
      );
    }

    const equityResult =
      calculateRangeEquity({
        heroCards:
        input.heroCards,

        villainRange:
        input.villainRange,

        board:
        input.board,

        ...(input.iterationsPerCombo !== undefined
          ? {
            iterationsPerCombo:
            input.iterationsPerCombo
          }
          : {})
      });

    const result =
      analyzeBet({
        equity:
        equityResult.equity,

        pot:
        input.pot,

        betAmount:
        input.betAmount,

        foldProbability:
        input.foldProbability
      });

    const decision =
      getDecision(
        result.expectedValue
      );

    return {
      action: "bet",

      equity:
      result.equity,

      expectedValue:
      result.expectedValue,

      decision,

      validVillainCombos:
      equityResult.combos
    };
  }

  if (input.action === "raise") {
    if (input.raiseAmount === undefined) {
      throw new Error(
        "raiseAmount is required when analyzing a raise decision",
      );
    }

    if (input.foldProbability === undefined) {
      throw new Error(
        "foldProbability is required when analyzing a raise decision",
      );
    }

    if (input.opponentCallAmount === undefined) {
      throw new Error(
        "opponentCallAmount is required when analyzing a raise decision",
      );
    }

    const equityResult =
      calculateRangeEquity({
        heroCards:
        input.heroCards,

        villainRange:
        input.villainRange,

        board:
        input.board,

        ...(input.iterationsPerCombo !== undefined
          ? {
            iterationsPerCombo:
            input.iterationsPerCombo
          }
          : {})
      });

    const result =
      analyzeRaise({
        equity:
        equityResult.equity,

        pot:
        input.pot,

        raiseAmount:
        input.raiseAmount,

        opponentCallAmount:
        input.opponentCallAmount,

        foldProbability:
        input.foldProbability
      });

    const decision =
      getDecision(
        result.expectedValue
      );

    return {
      action: "raise",

      equity:
      result.equity,

      expectedValue:
      result.expectedValue,

      decision,

      validVillainCombos:
      equityResult.combos
    };
  }

  return {
    action:
    input.action,

    equity:
      0,

    decision:
      "not_applicable",

    validVillainCombos:
      0,
  };
}

function getDecision(
  ev: number
): "profitable" | "unprofitable" | "break_even" {
  if (ev > 0) {
    return "profitable";
  }

  if (ev < 0) {
    return "unprofitable";
  }

  return "break_even";
}