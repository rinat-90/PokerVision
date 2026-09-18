import type {
  DetectedSeat
} from "../seat/seat-detector.js";

export interface TableSeatState {
  index: number;
  hasCards: boolean;
}

export interface TableState {
  seats: TableSeatState[];
}

export function createTableState(
  detectedSeats: DetectedSeat[]
): TableState {
  return {
    seats:
      detectedSeats.map(
        (seat) => ({
          index:
          seat.index,
          hasCards:
          seat.hasCards
        })
      )
  };
}