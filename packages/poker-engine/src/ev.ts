export interface ExpectedValue {
  equity: number;
  potBeforeCall: number;
  callAmount: number;
  winAmount: number;
  lossAmount: number;
  ev: number;
}

export function calculateCallEV(
  equity: number,
  potBeforeCall: number,
  callAmount: number
): ExpectedValue {
  if (equity < 0 || equity > 1) {
    throw new Error(
      "Equity must be between 0 and 1"
    );
  }

  if (potBeforeCall < 0) {
    throw new Error(
      "Pot cannot be negative"
    );
  }

  if (callAmount <= 0) {
    throw new Error(
      "Call amount must be greater than zero"
    );
  }

  const winAmount =
    potBeforeCall;

  const lossAmount =
    callAmount;

  const ev =
    equity * winAmount -
    (1 - equity) * lossAmount;

  return {
    equity,
    potBeforeCall,
    callAmount,
    winAmount,
    lossAmount,
    ev
  };
}