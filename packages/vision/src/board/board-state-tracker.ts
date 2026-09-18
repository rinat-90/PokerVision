import type {
  BoardState
} from "./board-state.js";

export interface BoardStateTrackerOptions {
  requiredStableFrames?: number;
}

export interface BoardStateTrackerResult {
  state: BoardState;
  changed: boolean;
}

export class BoardStateTracker {
  private readonly requiredStableFrames:
    number;

  private stableState:
    BoardState | null = null;

  private candidateState:
    BoardState | null = null;

  private candidateFrames = 0;

  constructor(
    options:
    BoardStateTrackerOptions = {}
  ) {
    this.requiredStableFrames =
      options.requiredStableFrames ??
      2;
  }

  update(
    state: BoardState
  ): BoardStateTrackerResult {
    if (!this.stableState) {
      this.stableState =
        state;

      return {
        state:
        this.stableState,
        changed: false
      };
    }

    if (
      state.street ===
      "unknown"
    ) {
      this.candidateState =
        null;

      this.candidateFrames =
        0;

      return {
        state:
        this.stableState,
        changed: false
      };
    }

    if (
      this.isSameState(
        this.stableState,
        state
      )
    ) {
      this.candidateState =
        null;

      this.candidateFrames =
        0;

      return {
        state:
        this.stableState,
        changed: false
      };
    }

    if (
      this.candidateState &&
      this.isSameState(
        this.candidateState,
        state
      )
    ) {
      this.candidateFrames +=
        1;
    } else {
      this.candidateState =
        state;

      this.candidateFrames =
        1;
    }

    if (
      this.candidateFrames <
      this.requiredStableFrames
    ) {
      return {
        state:
        this.stableState,
        changed: false
      };
    }

    this.stableState =
      this.candidateState;

    this.candidateState =
      null;

    this.candidateFrames =
      0;

    return {
      state:
      this.stableState,
      changed: true
    };
  }

  private isSameState(
    a: BoardState,
    b: BoardState
  ): boolean {
    return (
      a.cardCount ===
      b.cardCount &&
      a.street ===
      b.street
    );
  }
}