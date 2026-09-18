import {
  describe,
  expect,
  it
} from "vitest";

import {
  detectBoardEvent
} from "./board-event-detector.js";

import {
  createBoardState
} from "./board-state.js";

describe(
  "detectBoardEvent",
  () => {
    it(
      "detects flop dealt",
      () => {
        expect(
          detectBoardEvent(
            createBoardState(0),
            createBoardState(3)
          )
        ).toEqual({
          type:
            "flopDealt",
          cardCount: 3
        });
      }
    );

    it(
      "detects turn dealt",
      () => {
        expect(
          detectBoardEvent(
            createBoardState(3),
            createBoardState(4)
          )
        ).toEqual({
          type:
            "turnDealt",
          cardCount: 4
        });
      }
    );

    it(
      "detects river dealt",
      () => {
        expect(
          detectBoardEvent(
            createBoardState(4),
            createBoardState(5)
          )
        ).toEqual({
          type:
            "riverDealt",
          cardCount: 5
        });
      }
    );

    it(
      "does not emit an event when street is unchanged",
      () => {
        expect(
          detectBoardEvent(
            createBoardState(3),
            createBoardState(3)
          )
        ).toBeNull();
      }
    );

    it(
      "does not emit an event for unknown state",
      () => {
        expect(
          detectBoardEvent(
            createBoardState(3),
            createBoardState(2)
          )
        ).toBeNull();
      }
    );

    it(
      "does not emit an event when board clears",
      () => {
        expect(
          detectBoardEvent(
            createBoardState(4),
            createBoardState(0)
          )
        ).toBeNull();
      }
    );
  }
);