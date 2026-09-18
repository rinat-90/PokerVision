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

  private readonly stateTracker =
    new BoardStateTracker({
      requiredStableFrames: 2
    });

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

    return {
      timestampSeconds:
      frame.timestampSeconds,

      state:
      tracked.state,

      changed:
      tracked.changed
    };
  }
}