export interface BetAmountState {
  seatIndex: number;
  hasAmount: boolean;
  confidence: number;
}

export interface BetAmountChange {
  seatIndex: number;
  previousHasAmount: boolean;
  currentHasAmount: boolean;
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
          state.seatIndex === currentState.seatIndex
      );

    if (!previousState) {
      continue;
    }

    if (
      previousState.hasAmount !==
      currentState.hasAmount
    ) {
      changes.push({
        seatIndex:
        currentState.seatIndex,

        previousHasAmount:
        previousState.hasAmount,

        currentHasAmount:
        currentState.hasAmount
      });
    }
  }

  return {
    changed:
      changes.length > 0,

    changes
  };
}