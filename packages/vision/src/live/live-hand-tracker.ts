import {
  VideoHandBuilder
} from "../hand/video-hand-builder.js";

import type {
  VideoHand,
  VideoHandPlayer
} from "../hand/video-hand.js";

import type {
  RecognizedBoardEvent
} from "../board/recognized-board-event.js";

import type {
  LiveTableStateResult
} from "./live-table-state-processor.js";

import type {
  LiveBoardResult
} from "./live-board-processor.js";

export interface LiveHandTrackerResult {
  handActive: boolean;
  completedHand: VideoHand | null;
}

export class LiveHandTracker {
  private readonly builder =
    new VideoHandBuilder();

  private handActive = false;
  private initialized = false;

  update(
    result: LiveTableStateResult
  ): LiveHandTrackerResult {
    let completedHand:
      VideoHand | null = null;

    if (
      !this.initialized &&
      result.state
    ) {
      this.initialized = true;

      const players =
        this.getActivePlayers(
          result
        );

      if (
        players.length >= 2
      ) {
        this.builder.startPartial(
          players
        );

        this.handActive = true;
      }
    }

    for (
      const event
      of result.lifecycleEvents
      ) {
      if (
        event.type ===
        "handStarted"
      ) {
        const players:
          VideoHandPlayer[] =
          event.activeSeatIndexes.map(
            seatIndex => ({
              seatIndex,
              hasCards: true
            })
          );

        this.builder.start(
          result.timestampSeconds,
          players
        );

        this.handActive = true;

        continue;
      }

      if (
        event.type ===
        "handEnded" &&
        this.handActive
      ) {
        completedHand =
          this.builder.complete(
            result.timestampSeconds
          );

        this.handActive = false;
      }
    }

    return {
      handActive:
      this.handActive,

      completedHand
    };
  }

  updateBoard(
    result: LiveBoardResult
  ): void {
    if (
      !this.handActive ||
      !result.event
    ) {
      return;
    }

    this.addBoardEvent(
      result.timestampSeconds,
      result.event
    );
  }

  isHandActive(): boolean {
    return this.handActive;
  }

  private addBoardEvent(
    timestampSeconds: number,
    event: RecognizedBoardEvent
  ): void {
    this.builder.addBoardEvent(
      timestampSeconds,
      event
    );
  }

  private getActivePlayers(
    result: LiveTableStateResult
  ): VideoHandPlayer[] {
    if (!result.state) {
      return [];
    }

    return result.state.seats
      .filter(
        seat =>
          seat.hasCards
      )
      .map(
        seat => ({
          seatIndex:
          seat.index,

          hasCards: true
        })
      );
  }
}