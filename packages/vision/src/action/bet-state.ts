export interface SeatBetState {
  seatIndex: number;
  hasBet: boolean;
}

export interface BetState {
  seats: SeatBetState[];
}

export function createBetState(
  seatIndexes: number[],
  betSeatIndexes: number[]
): BetState {
  const betSeats =
    new Set(
      betSeatIndexes
    );

  return {
    seats:
      seatIndexes.map(
        (seatIndex) => ({
          seatIndex,
          hasBet:
            betSeats.has(
              seatIndex
            )
        })
      )
  };
}