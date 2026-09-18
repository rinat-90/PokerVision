export interface TrackedSeatBetState {
  hasBet: boolean;
  changed: boolean;
}

export interface SeatBetStateTrackerOptions {
  stableFrames?: number;
}

export class SeatBetStateTracker {
  private readonly stableFrames: number;

  private stableState:
    boolean | null = null;

  private candidateState:
    boolean | null = null;

  private candidateFrames = 0;

  constructor(
    options: SeatBetStateTrackerOptions = {}
  ) {
    this.stableFrames =
      options.stableFrames ??
      2;
  }

  update(
    hasBet: boolean
  ): TrackedSeatBetState {
    if (
      this.stableState === null
    ) {
      this.stableState =
        hasBet;

      return {
        hasBet,
        changed: false
      };
    }

    if (
      hasBet ===
      this.stableState
    ) {
      this.candidateState =
        null;

      this.candidateFrames =
        0;

      return {
        hasBet:
        this.stableState,
        changed: false
      };
    }

    if (
      this.candidateState ===
      hasBet
    ) {
      this.candidateFrames += 1;
    } else {
      this.candidateState =
        hasBet;

      this.candidateFrames =
        1;
    }

    if (
      this.candidateFrames <
      this.stableFrames
    ) {
      return {
        hasBet:
        this.stableState,
        changed: false
      };
    }

    this.stableState =
      hasBet;

    this.candidateState =
      null;

    this.candidateFrames =
      0;

    return {
      hasBet:
      this.stableState,
      changed: true
    };
  }
}