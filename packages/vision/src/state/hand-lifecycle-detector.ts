import type {
  TableState
} from "./table-state.js";

export type HandLifecycleEventType =
  | "handStarted"
  | "handEnded";

export interface HandLifecycleEvent {
  type: HandLifecycleEventType;
  activeSeatIndexes: number[];
}

export interface HandLifecycleDetectorOptions {
  minPlayers?: number;
}

export class HandLifecycleDetector {
  private readonly minPlayers:
    number;

  private previousState:
    TableState | null = null;

  constructor(
    options:
    HandLifecycleDetectorOptions = {}
  ) {
    this.minPlayers =
      options.minPlayers ?? 2;
  }

  update(
    state: TableState
  ): HandLifecycleEvent[] {
    if (!this.previousState) {
      this.previousState =
        state;

      return [];
    }

    const previousActiveSeats =
      this.getActiveSeatIndexes(
        this.previousState
      );

    const currentActiveSeats =
      this.getActiveSeatIndexes(
        state
      );

    this.previousState =
      state;

    const previousHasHand =
      previousActiveSeats.length >=
      this.minPlayers;

    const currentHasHand =
      currentActiveSeats.length >=
      this.minPlayers;

    if (
      !previousHasHand &&
      currentHasHand
    ) {
      return [
        {
          type:
            "handStarted",
          activeSeatIndexes:
          currentActiveSeats
        }
      ];
    }

    if (
      previousHasHand &&
      currentActiveSeats.length === 0
    ) {
      return [
        {
          type:
            "handEnded",
          activeSeatIndexes: []
        }
      ];
    }

    return [];
  }

  private getActiveSeatIndexes(
    state: TableState
  ): number[] {
    return state.seats
      .filter(
        (seat) =>
          seat.hasCards
      )
      .map(
        (seat) =>
          seat.index
      );
  }
}