import type {
  BetAmountState
} from "./bet-amount-state.js";

export interface BetAmountStateChange {
  seatIndex: number;
  previousAmount: number | null;
  currentAmount: number | null;
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

      /*
       * First observation establishes the baseline.
       * It does not emit a change.
       */
      if (!currentStable) {
        this.stableState.set(
          state.seatIndex,
          state
        );

        continue;
      }

      /*
       * Raw observation agrees with stable state.
       * Cancel any pending candidate.
       */
      if (
        state.amount ===
        currentStable.amount
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

      /*
       * Start tracking a new candidate amount.
       */
      if (
        !candidate ||
        candidate.amount !==
        state.amount
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
        (
          this.candidateFrames.get(
            state.seatIndex
          ) ?? 0
        ) + 1;

      this.candidateFrames.set(
        state.seatIndex,
        frames
      );

      /*
       * Promote the candidate only after it
       * has remained stable long enough.
       */
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

          previousAmount:
          currentStable.amount,

          currentAmount:
          state.amount,

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