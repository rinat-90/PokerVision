export interface RaiseExpectedValue {
  equity: number;

  potBeforeRaise: number;

  raiseAmount: number;

  opponentCallAmount: number;

  foldProbability: number;

  callProbability: number;

  foldValue: number;

  callValue: number;

  ev: number;
}

export interface RaiseEVInput {
  equity: number;

  potBeforeRaise: number;

  raiseAmount: number;

  opponentCallAmount: number;

  foldProbability: number;
}

export function calculateRaiseEV(
  input: RaiseEVInput
): RaiseExpectedValue {
  const {
    equity,
    potBeforeRaise,
    raiseAmount,
    opponentCallAmount,
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

  if (
    potBeforeRaise < 0
  ) {
    throw new Error(
      "Pot cannot be negative"
    );
  }

  if (
    raiseAmount <= 0
  ) {
    throw new Error(
      "Raise amount must be greater than zero"
    );
  }

  if (
    opponentCallAmount < 0
  ) {
    throw new Error(
      "Opponent call amount cannot be negative"
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
    potBeforeRaise;

  const potAfterCall =
    potBeforeRaise +
    raiseAmount +
    opponentCallAmount;

  const callValue =
    equity * potAfterCall -
    (1 - equity) * raiseAmount;

  const ev =
    foldProbability * foldValue +
    callProbability * callValue;

  return {
    equity,
    potBeforeRaise,
    raiseAmount,
    opponentCallAmount,
    foldProbability,
    callProbability,
    foldValue,
    callValue,
    ev
  };
}