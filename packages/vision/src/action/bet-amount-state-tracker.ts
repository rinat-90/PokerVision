import type {
  BetAmountState
} from "./bet-amount-state.js";

export interface BetAmountStateChange {
  seatIndex: number;
  hasAmount: boolean;
  confidence: number;
}

export interface BetAmountStateTrackerResult {
  raw: BetAmountState[];
  stable: BetAmountState[];
  changed: boolean;
  changes: BetAmountStateChange[];
}

export interface BetAmountStateTrackerOptions {
  requiredStableFrames?: number;
}

export class BetAmountStateTracker {
  private readonly requiredStableFrames: number;

  private stableState = new Map<
    number,
    BetAmountState
  >();

  private candidateState = new Map<
    number,
    BetAmountState
  >();

  private candidateFrames = new Map<
    number,
    number
  >();

  constructor(
    options: BetAmountStateTrackerOptions = {}
  ) {
    this.requiredStableFrames =
      options.requiredStableFrames ?? 2;
  }

  update(
    raw: BetAmountState[]
  ): BetAmountStateTrackerResult {
    const changes: BetAmountStateChange[] = [];

    for (const state of raw) {
      const currentStable =
        this.stableState.get(
          state.seatIndex
        );

      if (!currentStable) {
        this.stableState.set(
          state.seatIndex,
          state
        );

        continue;
      }

      if (
        state.hasAmount ===
        currentStable.hasAmount
      ) {
        this.candidateState.delete(
          state.seatIndex
        );

        this.candidateFrames.delete(
          state.seatIndex
        );

        this.stableState.set(
          state.seatIndex,
          state
        );

        continue;
      }

      const candidate =
        this.candidateState.get(
          state.seatIndex
        );

      if (
        !candidate ||
        candidate.hasAmount !==
        state.hasAmount
      ) {
        this.candidateState.set(
          state.seatIndex,
          state
        );

        this.candidateFrames.set(
          state.seatIndex,
          1
        );

        continue;
      }

      const frames =
        (this.candidateFrames.get(
          state.seatIndex
        ) ?? 0) + 1;

      this.candidateFrames.set(
        state.seatIndex,
        frames
      );

      if (
        frames >=
        this.requiredStableFrames
      ) {
        this.stableState.set(
          state.seatIndex,
          state
        );

        this.candidateState.delete(
          state.seatIndex
        );

        this.candidateFrames.delete(
          state.seatIndex
        );

        changes.push({
          seatIndex:
          state.seatIndex,
          hasAmount:
          state.hasAmount,
          confidence:
          state.confidence
        });
      }
    }

    const stable =
      raw.map(
        (state) =>
          this.stableState.get(
            state.seatIndex
          ) ?? state
      );

    return {
      raw,
      stable,
      changed:
        changes.length > 0,
      changes
    };
  }
}