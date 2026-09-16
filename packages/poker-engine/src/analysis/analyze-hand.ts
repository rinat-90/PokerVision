import {
  calculateCallEV
} from "../ev.js";

import {
  calculatePotOdds
} from "../pot-odds.js";

import {
  calculateRangeEquity
} from "../equity/range-equity.js";

import type {
  HandAnalysisInput,
  HandAnalysisResult,
  AnalysisDecision
} from "./types.js";

export function analyzeHand(
  input: HandAnalysisInput
): HandAnalysisResult {
  const {
    heroCards,
    villainRange,
    board,
    pot,
    callAmount,
    iterationsPerCombo
  } = input;

  const equityResult =
    calculateRangeEquity({
      heroCards,
      villainRange,
      board,
      ...(iterationsPerCombo !== undefined
        ? { iterationsPerCombo }
        : {})
    });

  const potOdds =
    calculatePotOdds(
      pot,
      callAmount
    );

  const expectedValue =
    calculateCallEV(
      equityResult.equity,
      pot,
      callAmount
    );

  const decision =
    getDecision(expectedValue.ev);

  return {
    equity: equityResult.equity,

    potOdds,

    expectedValue,

    decision,

    validVillainCombos:
    equityResult.combos
  };
}

function getDecision(
  ev: number
): AnalysisDecision {
  if (ev > 0) {
    return "profitable";
  }

  if (ev < 0) {
    return "unprofitable";
  }

  return "break_even";
}