import type {
  TableSeatState,
  TableState
} from "./table-state.js";

export interface SeatStateChange {
  index: number;
  previousHasCards:
    boolean | null;
  currentHasCards:
    boolean | null;
}

export interface TableStateDiff {
  changed: boolean;
  seatChanges: SeatStateChange[];
}

export function diffTableStates(
  previous: TableState,
  current: TableState
): TableStateDiff {
  const previousByIndex =
    new Map<
      number,
      TableSeatState
    >(
      previous.seats.map(
        (seat) => [
          seat.index,
          seat
        ]
      )
    );

  const currentByIndex =
    new Map<
      number,
      TableSeatState
    >(
      current.seats.map(
        (seat) => [
          seat.index,
          seat
        ]
      )
    );

  const indexes =
    new Set([
      ...previousByIndex.keys(),
      ...currentByIndex.keys()
    ]);

  const seatChanges:
    SeatStateChange[] = [];

  for (
    const index
    of indexes
    ) {
    const previousSeat =
      previousByIndex.get(
        index
      );

    const currentSeat =
      currentByIndex.get(
        index
      );

    if (
      previousSeat &&
      currentSeat &&
      previousSeat.hasCards ===
      currentSeat.hasCards
    ) {
      continue;
    }

    seatChanges.push({
      index,
      previousHasCards:
        previousSeat
          ?.hasCards ??
        null,
      currentHasCards:
        currentSeat
          ?.hasCards ??
        null
    });
  }

  return {
    changed:
      seatChanges.length > 0,
    seatChanges
  };
}