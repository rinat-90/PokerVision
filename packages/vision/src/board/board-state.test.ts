import {
  describe,
  expect,
  it
} from "vitest";

import {
  createBoardState
} from "./board-state.js";

describe(
  "createBoardState",
  () => {
    it(
      "detects preflop",
      () => {
        expect(
          createBoardState(0)
        ).toEqual({
          cardCount: 0,
          street:
            "preflop"
        });
      }
    );

    it(
      "detects flop",
      () => {
        expect(
          createBoardState(3)
        ).toEqual({
          cardCount: 3,
          street:
            "flop"
        });
      }
    );

    it(
      "detects turn",
      () => {
        expect(
          createBoardState(4)
        ).toEqual({
          cardCount: 4,
          street:
            "turn"
        });
      }
    );

    it(
      "detects river",
      () => {
        expect(
          createBoardState(5)
        ).toEqual({
          cardCount: 5,
          street:
            "river"
        });
      }
    );

    it(
      "returns unknown for an invalid board count",
      () => {
        expect(
          createBoardState(2)
        ).toEqual({
          cardCount: 2,
          street:
            "unknown"
        });

        expect(
          createBoardState(6)
        ).toEqual({
          cardCount: 6,
          street:
            "unknown"
        });
      }
    );
  }
);