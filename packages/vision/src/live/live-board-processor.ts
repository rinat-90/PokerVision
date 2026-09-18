import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  SourceFrame
} from "../source/frame-source.js";

import type {
  TableDetector
} from "../table/table-detector.js";

import {
  createBoardRegion
} from "../board/board-region.js";

import type {
  BoardCardRecognitionResult
} from "../board/board-card-recognizer.js";

import {
  RecognizedBoardEventDetector
} from "../board/recognized-board-event-detector.js";

import type {
  BoardState
} from "../board/board-state.js";

import type {
  RecognizedBoardEvent
} from "../board/recognized-board-event.js";

export interface LiveBoardRecognizer {
  recognize(
    frame: VideoFrame,
    boardRegion: {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ): Promise<BoardCardRecognitionResult>;
}

export interface LiveBoardResult {
  timestampSeconds: number;
  state: BoardState | null;
  event: RecognizedBoardEvent | null;
}

export class LiveBoardProcessor {
  private readonly eventDetector =
    new RecognizedBoardEventDetector({
      requiredStableFrames: 2
    });

  constructor(
    private readonly tableDetector:
    TableDetector,

    private readonly boardRecognizer:
    LiveBoardRecognizer
  ) {}

  async process(
    frame: SourceFrame
  ): Promise<LiveBoardResult> {
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
        event: null
      };
    }

    const boardRegion =
      createBoardRegion(
        tableDetection.region
      );

    const recognition =
      await this.boardRecognizer.recognize(
        frame,
        boardRegion
      );

    const cards =
      recognition.cards
        .map(
          card =>
            card.recognition.card
        )
        .filter(
          card =>
            card !== null
        );

    const detected =
      this.eventDetector.update(
        recognition.cards.length,
        cards
      );

    return {
      timestampSeconds:
      frame.timestampSeconds,

      state:
      detected.state,

      event:
      detected.event
    };
  }
}