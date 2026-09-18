import type {
  BetState
} from "./bet-state.js";

export interface BetStateDiff {
  appeared: number[];
  cleared: number[];
}

export function diffBetStates(
  previous: BetState,
  current: BetState
): BetStateDiff {
  const previousBySeat =
    new Map(
      previous.seats.map(
        (seat) => [
          seat.seatIndex,
          seat.hasBet
        ]
      )
    );

  const currentBySeat =
    new Map(
      current.seats.map(
        (seat) => [
          seat.seatIndex,
          seat.hasBet
        ]
      )
    );

  const seatIndexes =
    new Set([
      ...previousBySeat.keys(),
      ...currentBySeat.keys()
    ]);

  const appeared: number[] =
    [];

  const cleared: number[] =
    [];

  for (
    const seatIndex
    of seatIndexes
    ) {
    const hadBet =
      previousBySeat.get(
        seatIndex
      ) ?? false;

    const hasBet =
      currentBySeat.get(
        seatIndex
      ) ?? false;

    if (
      !hadBet &&
      hasBet
    ) {
      appeared.push(
        seatIndex
      );
    }

    if (
      hadBet &&
      !hasBet
    ) {
      cleared.push(
        seatIndex
      );
    }
  }

  return {
    appeared,
    cleared
  };
}