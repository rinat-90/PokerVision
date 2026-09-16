export interface PotOdds {
  potBeforeCall: number;
  callAmount: number;
  potAfterCall: number;
  requiredEquity: number;
  ratio: string;
}

export function calculatePotOdds(
  potBeforeCall: number,
  callAmount: number
): PotOdds {
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

  const potAfterCall =
    potBeforeCall + callAmount;

  const requiredEquity =
    callAmount / potAfterCall;

  return {
    potBeforeCall,
    callAmount,
    potAfterCall,
    requiredEquity,
    ratio: formatRatio(
      potBeforeCall,
      callAmount
    )
  };
}

function formatRatio(
  pot: number,
  call: number
): string {
  return `${pot}:${call}`;
}