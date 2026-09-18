export type PokerStreet =
  | "preflop"
  | "flop"
  | "turn"
  | "river";

export interface PlayerActionContext {
  seatIndex: number;

  street: PokerStreet;

  previousAmount: number | null;

  currentAmount: number | null;

  highestAmount: number;

  amountToCall: number;

  chipPresent: boolean;
}

export function createPlayerActionContext(
  input: {
    seatIndex: number;
    street: PokerStreet;
    previousAmount: number | null;
    currentAmount: number | null;
    highestAmount: number;
    chipPresent: boolean;
  }
): PlayerActionContext {
  const previousAmount =
    input.previousAmount ?? 0;

  return {
    ...input,

    amountToCall:
      Math.max(
        0,
        input.highestAmount -
        previousAmount
      )
  };
}