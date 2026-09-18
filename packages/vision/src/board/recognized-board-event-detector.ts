import type {
  RecognizedCard
} from "../card/card-recognizer.js";

import {
  createBoardState,
  type BoardState
} from "./board-state.js";

import {
  BoardStateTracker,
  type BoardStateTrackerOptions
} from "./board-state-tracker.js";

import {
  detectBoardEvent
} from "./board-event-detector.js";

import {
  createRecognizedBoardEvent,
  type RecognizedBoardEvent
} from "./recognized-board-event.js";

export interface RecognizedBoardEventDetectorResult {
  state: BoardState;
  changed: boolean;
  event: RecognizedBoardEvent | null;
}

export class RecognizedBoardEventDetector {
  private readonly tracker:
    BoardStateTracker;

  private previousStableState:
    BoardState =
    createBoardState(0);

  constructor(
    options:
    BoardStateTrackerOptions = {}
  ) {
    this.tracker =
      new BoardStateTracker(
        options
      );
  }

  update(
    cardCount: number,
    cards: RecognizedCard[]
  ): RecognizedBoardEventDetectorResult {
    const tracked =
      this.tracker.update(
        createBoardState(
          cardCount
        )
      );

    let event:
      RecognizedBoardEvent | null =
      null;

    if (
      tracked.changed
    ) {
      const boardEvent =
        detectBoardEvent(
          this.previousStableState,
          tracked.state
        );

      if (boardEvent) {
        event =
          createRecognizedBoardEvent(
            boardEvent,
            cards
          );
      }
    }

    this.previousStableState =
      tracked.state;

    return {
      state:
      tracked.state,
      changed:
      tracked.changed,
      event
    };
  }
}