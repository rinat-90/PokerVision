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

  private initialized = false;
  private handActive = false;

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
    const activeSeatIndexes =
      this.getActiveSeatIndexes(
        state
      );

    if (!this.initialized) {
      this.initialized = true;

      this.handActive =
        activeSeatIndexes.length >=
        this.minPlayers;

      return [];
    }

    if (
      !this.handActive &&
      activeSeatIndexes.length >=
      this.minPlayers
    ) {
      this.handActive = true;

      return [
        {
          type:
            "handStarted",

          activeSeatIndexes
        }
      ];
    }

    if (
      this.handActive &&
      activeSeatIndexes.length === 0
    ) {
      this.handActive = false;

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
        seat =>
          seat.hasCards
      )
      .map(
        seat =>
          seat.index
      );
  }
}