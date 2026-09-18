import type {
  PokerStreet
} from "./player-action-context.js";

export interface PlayerContribution {
  seatIndex: number;
  amount: number;
}

export interface PlayerContributionState {
  street: PokerStreet;

  contributions:
    PlayerContribution[];

  highestAmount: number;

  complete: boolean;
}

export function createPlayerContributionState(
  street: PokerStreet,
  contributions: PlayerContribution[],
  complete = true
): PlayerContributionState {
  let highestAmount = 0;

  for (
    const contribution
    of contributions
    ) {
    highestAmount =
      Math.max(
        highestAmount,
        contribution.amount
      );
  }

  return {
    street,
    contributions,
    highestAmount,
    complete
  };
}