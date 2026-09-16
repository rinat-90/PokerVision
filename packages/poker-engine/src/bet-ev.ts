export interface BetExpectedValue {
  equity: number;

  potBeforeBet: number;

  betAmount: number;

  foldProbability: number;

  callProbability: number;

  foldValue: number;

  callValue: number;

  ev: number;
}

export interface BetEVInput {
  equity: number;

  potBeforeBet: number;

  betAmount: number;

  foldProbability: number;
}

export function calculateBetEV(
  input: BetEVInput
): BetExpectedValue {
  const {
    equity,
    potBeforeBet,
    betAmount,
    foldProbability
  } = input;

  if (
    equity < 0 ||
    equity > 1
  ) {
    throw new Error(
      "Equity must be between 0 and 1"
    );
  }

  if (potBeforeBet < 0) {
    throw new Error(
      "Pot cannot be negative"
    );
  }

  if (betAmount <= 0) {
    throw new Error(
      "Bet amount must be greater than zero"
    );
  }

  if (
    foldProbability < 0 ||
    foldProbability > 1
  ) {
    throw new Error(
      "Fold probability must be between 0 and 1"
    );
  }

  const callProbability =
    1 - foldProbability;

  const foldValue =
    potBeforeBet;

  const callValue =
    equity * (
      potBeforeBet +
      betAmount
    ) -
    (1 - equity) *
    betAmount;

  const ev =
    foldProbability *
    foldValue +
    callProbability *
    callValue;

  return {
    equity,
    potBeforeBet,
    betAmount,
    foldProbability,
    callProbability,
    foldValue,
    callValue,
    ev
  };
}