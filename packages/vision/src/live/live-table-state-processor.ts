import type {
  SourceFrame
} from "../source/frame-source.js";

import type {
  TableDetector
} from "../table/table-detector.js";

import {
  createSixMaxSeatRegions
} from "../seat/seat-region.js";

import type {
  SeatDetector
} from "../seat/seat-detector.js";

import {
  createTableState,
  type TableState
} from "../state/table-state.js";

import {
  TableStateTracker
} from "../state/table-state-tracker.js";

import {
  HandLifecycleDetector,
  type HandLifecycleEvent
} from "../state/hand-lifecycle-detector.js";

export interface LiveTableStateResult {
  timestampSeconds: number;
  state: TableState | null;
  lifecycleEvents:
    HandLifecycleEvent[];
}

export class LiveTableStateProcessor {
  private readonly stateTracker =
    new TableStateTracker({
      requiredStableFrames: 2
    });

  private readonly lifecycleDetector =
    new HandLifecycleDetector();

  constructor(
    private readonly tableDetector:
    TableDetector,

    private readonly seatDetector:
    SeatDetector
  ) {}

  async process(
    frame: SourceFrame
  ): Promise<LiveTableStateResult> {
    const tableDetection =
      await this.tableDetector.detect(
        frame
      );

    if (
      !tableDetection.found ||
      !tableDetection.region
    ) {
      return {
        timestampSeconds:
        frame.timestampSeconds,

        state: null,

        lifecycleEvents: []
      };
    }

    const seatRegions =
      createSixMaxSeatRegions(
        tableDetection.region,
        {
          width:
          frame.width,

          height:
          frame.height
        }
      );

    const detectedSeats =
      await this.seatDetector.detect(
        frame,
        seatRegions
      );

    const observedState =
      createTableState(
        detectedSeats
      );

    const tracked =
      this.stateTracker.update(
        observedState
      );

    const lifecycleEvents =
      this.lifecycleDetector.update(
        tracked.state
      );

    return {
      timestampSeconds:
      frame.timestampSeconds,

      state:
      tracked.state,

      lifecycleEvents
    };
  }
}