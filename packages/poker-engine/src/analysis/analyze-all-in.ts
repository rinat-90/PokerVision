export interface AnalyzeAllInInput {
  equity: number;
  pot: number;
  allInAmount: number;
  opponentCallAmount: number;
  foldProbability: number;
}

export interface AnalyzeAllInResult {
  action: "all_in";
  equity: number;
  expectedValue: number;
}

export function analyzeAllIn(
  input: AnalyzeAllInInput
): AnalyzeAllInResult {
  const {
    equity,
    pot,
    allInAmount,
    opponentCallAmount,
    foldProbability
  } = input;

  const callProbability =
    1 - foldProbability;

  const foldEV =
    pot * foldProbability;

  const calledPot =
    pot +
    allInAmount +
    opponentCallAmount;

  const calledEV =
    (
      equity * calledPot
    ) -
    allInAmount;

  const expectedValue =
    foldEV +
    callProbability * calledEV;

  return {
    action: "all_in",
    equity,
    expectedValue
  };
}