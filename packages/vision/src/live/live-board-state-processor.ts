import type {
  SourceFrame
} from "../source/frame-source.js";

import type {
  TableDetector
} from "../table/table-detector.js";

import {
  cropFrame
} from "../table/crop-frame.js";

import type {
  ImageDecoder
} from "../image/image-decoder.js";

import {
  createBoardRegion
} from "../board/board-region.js";

import {
  BoardCardDetector
} from "../board/board-card-detector.js";

import {
  createBoardState,
  type BoardState
} from "../board/board-state.js";

import {
  BoardStateTracker
} from "../board/board-state-tracker.js";

export interface LiveBoardStateResult {
  timestampSeconds: number;
  state: BoardState | null;
  changed: boolean;
}

export class LiveBoardStateProcessor {
  private readonly cardDetector =
    new BoardCardDetector();

  private stateTracker =
    this.createStateTracker();

  private stableState:
    BoardState | null = null;

  constructor(
    private readonly tableDetector:
    TableDetector,

    private readonly decoder:
    ImageDecoder
  ) {}

  async process(
    frame: SourceFrame
  ): Promise<LiveBoardStateResult> {
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
        changed: false
      };
    }

    const boardRegion =
      createBoardRegion(
        tableDetection.region
      );

    const boardFrame =
      await cropFrame(
        frame,
        boardRegion,
        this.decoder
      );

    const detection =
      this.cardDetector.detect(
        boardFrame
      );

    const tracked =
      this.stateTracker.update(
        createBoardState(
          detection.count
        )
      );

    if (
      this.stableState &&
      this.isRegression(
        this.stableState,
        tracked.state
      )
    ) {
      return {
        timestampSeconds:
        frame.timestampSeconds,

        state:
        this.stableState,

        changed: false
      };
    }

    const changed =
      this.stableState !== null &&
      (
        this.stableState.street !==
        tracked.state.street ||
        this.stableState.cardCount !==
        tracked.state.cardCount
      );

    this.stableState =
      tracked.state;

    return {
      timestampSeconds:
      frame.timestampSeconds,

      state:
      this.stableState,

      changed
    };
  }

  reset(): void {
    this.stateTracker =
      this.createStateTracker();

    this.stableState =
      null;
  }

  private createStateTracker():
    BoardStateTracker {
    return new BoardStateTracker({
      requiredStableFrames: 2
    });
  }

  private isRegression(
    current: BoardState,
    next: BoardState
  ): boolean {
    return (
      this.streetOrder(
        next
      ) <
      this.streetOrder(
        current
      )
    );
  }

  private streetOrder(
    state: BoardState
  ): number {
    switch (state.street) {
      case "preflop":
        return 0;

      case "flop":
        return 1;

      case "turn":
        return 2;

      case "river":
        return 3;

      case "unknown":
        return -1;
    }
  }
}