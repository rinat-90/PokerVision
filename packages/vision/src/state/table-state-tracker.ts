import type {
  TableState
} from "./table-state.js";

import {
  diffTableStates,
  type TableStateDiff
} from "./table-state-diff.js";

export interface TableStateTrackerResult {
  state: TableState;
  diff: TableStateDiff;
  changed: boolean;
}

export interface TableStateTrackerOptions {
  requiredStableFrames?: number;
}

export class TableStateTracker {
  private readonly requiredStableFrames:
    number;

  private stableState:
    TableState | null = null;

  private candidateState:
    TableState | null = null;

  private candidateFrames = 0;

  constructor(
    options:
    TableStateTrackerOptions = {}
  ) {
    this.requiredStableFrames =
      options.requiredStableFrames ??
      2;
  }

  update(
    state: TableState
  ): TableStateTrackerResult {
    if (!this.stableState) {
      this.stableState =
        state;

      return {
        state:
        this.stableState,
        diff: {
          changed: false,
          seatChanges: []
        },
        changed: false
      };
    }

    const stableDiff =
      diffTableStates(
        this.stableState,
        state
      );

    if (!stableDiff.changed) {
      this.candidateState =
        null;

      this.candidateFrames =
        0;

      return {
        state:
        this.stableState,
        diff: {
          changed: false,
          seatChanges: []
        },
        changed: false
      };
    }

    if (
      this.candidateState &&
      !diffTableStates(
        this.candidateState,
        state
      ).changed
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
        diff: {
          changed: false,
          seatChanges: []
        },
        changed: false
      };
    }

    const previousState =
      this.stableState;

    this.stableState =
      this.candidateState;

    this.candidateState =
      null;

    this.candidateFrames =
      0;

    const diff =
      diffTableStates(
        previousState,
        this.stableState
      );

    return {
      state:
      this.stableState,
      diff,
      changed:
      diff.changed
    };
  }
}