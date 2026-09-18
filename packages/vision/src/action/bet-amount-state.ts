export interface BetAmountState {
  seatIndex: number;
  amount: number | null;
  rawText: string | null;
  confidence: number;
}

export interface BetAmountChange {
  seatIndex: number;
  previousAmount: number | null;
  currentAmount: number | null;
}

export interface BetAmountStateDiff {
  changed: boolean;
  changes: BetAmountChange[];
}

export function diffBetAmountStates(
  previous: BetAmountState[],
  current: BetAmountState[]
): BetAmountStateDiff {
  const changes: BetAmountChange[] = [];

  for (const currentState of current) {
    const previousState =
      previous.find(
        (state) =>
          state.seatIndex ===
          currentState.seatIndex
      );

    if (!previousState) {
      continue;
    }

    if (
      previousState.amount !==
      currentState.amount
    ) {
      changes.push({
        seatIndex:
        currentState.seatIndex,

        previousAmount:
        previousState.amount,

        currentAmount:
        currentState.amount
      });
    }
  }

  return {
    changed:
      changes.length > 0,

    changes
  };
}