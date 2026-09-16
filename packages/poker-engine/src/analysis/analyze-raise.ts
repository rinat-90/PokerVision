import {
  calculateRaiseEV
} from "../raise-ev.js";

import {
  createBetResponseModel
} from "./bet-response.js";

export interface AnalyzeRaiseInput {
  equity: number;
  pot: number;
  raiseAmount: number;
  opponentCallAmount: number;
  foldProbability: number;
}

export interface AnalyzeRaiseResult {
  equity: number;
  pot: number;
  raiseAmount: number;
  opponentCallAmount: number;
  foldProbability: number;
  callProbability: number;
  expectedValue: number;
}

export function analyzeRaise(
  input: AnalyzeRaiseInput
): AnalyzeRaiseResult {
  const responseModel =
    createBetResponseModel({
      foldProbability:
      input.foldProbability
    });

  const expectedValue =
    calculateRaiseEV({
      equity:
      input.equity,

      potBeforeRaise:
      input.pot,

      raiseAmount:
      input.raiseAmount,

      opponentCallAmount:
      input.opponentCallAmount,

      foldProbability:
      responseModel.foldProbability
    });

  return {
    equity:
    expectedValue.equity,

    pot:
    expectedValue.potBeforeRaise,

    raiseAmount:
    expectedValue.raiseAmount,

    opponentCallAmount:
    expectedValue.opponentCallAmount,

    foldProbability:
    expectedValue.foldProbability,

    callProbability:
    expectedValue.callProbability,

    expectedValue:
    expectedValue.ev
  };
}