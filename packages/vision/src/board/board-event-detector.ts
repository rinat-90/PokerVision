import type {
  BoardState
} from "./board-state.js";

export type BoardEventType =
  | "flopDealt"
  | "turnDealt"
  | "riverDealt";

export interface BoardEvent {
  type: BoardEventType;
  cardCount: number;
}

export function detectBoardEvent(
  previous: BoardState,
  current: BoardState
): BoardEvent | null {
  if (
    previous.street ===
    current.street
  ) {
    return null;
  }

  switch (
    current.street
    ) {
    case "flop":
      return {
        type:
          "flopDealt",
        cardCount: 3
      };

    case "turn":
      return {
        type:
          "turnDealt",
        cardCount: 4
      };

    case "river":
      return {
        type:
          "riverDealt",
        cardCount: 5
      };

    default:
      return null;
  }
}