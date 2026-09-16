import {
  calculateBetEV
} from "../bet-ev.js";

import {
  createBetResponseModel
} from "./bet-response.js";

export interface AnalyzeBetInput {
  equity: number;
  pot: number;
  betAmount: number;
  foldProbability: number;
}

export interface AnalyzeBetResult {
  equity: number;
  pot: number;
  betAmount: number;
  foldProbability: number;
  callProbability: number;
  expectedValue: number;
}

export function analyzeBet(
  input: AnalyzeBetInput
): AnalyzeBetResult {
  const responseModel =
    createBetResponseModel({
      foldProbability:
      input.foldProbability
    });

  const expectedValue =
    calculateBetEV({
      equity: input.equity,
      potBeforeBet: input.pot,
      betAmount: input.betAmount,
      foldProbability:
      responseModel.foldProbability
    });

  return {
    equity:
    expectedValue.equity,

    pot:
    expectedValue.potBeforeBet,

    betAmount:
    expectedValue.betAmount,

    foldProbability:
    expectedValue.foldProbability,

    callProbability:
    expectedValue.callProbability,

    expectedValue:
    expectedValue.ev
  };
}