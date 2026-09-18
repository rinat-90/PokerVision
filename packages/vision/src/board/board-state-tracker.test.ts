import {
  describe,
  expect,
  it
} from "vitest";

import {
  BoardStateTracker
} from "./board-state-tracker.js";

import {
  createBoardState
} from "./board-state.js";

describe(
  "BoardStateTracker",
  () => {
    it(
      "accepts the initial state",
      () => {
        const tracker =
          new BoardStateTracker();

        expect(
          tracker.update(
            createBoardState(0)
          )
        ).toEqual({
          state:
            createBoardState(0),
          changed: false
        });
      }
    );

    it(
      "does not accept a one-frame street change",
      () => {
        const tracker =
          new BoardStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createBoardState(0)
        );

        const result =
          tracker.update(
            createBoardState(3)
          );

        expect(result)
          .toEqual({
            state:
              createBoardState(0),
            changed: false
          });
      }
    );

    it(
      "accepts a street after stable frames",
      () => {
        const tracker =
          new BoardStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createBoardState(0)
        );

        tracker.update(
          createBoardState(3)
        );

        const result =
          tracker.update(
            createBoardState(3)
          );

        expect(result)
          .toEqual({
            state:
              createBoardState(3),
            changed: true
          });
      }
    );

    it(
      "ignores an unknown transitional frame",
      () => {
        const tracker =
          new BoardStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createBoardState(0)
        );

        const result =
          tracker.update(
            createBoardState(2)
          );

        expect(result)
          .toEqual({
            state:
              createBoardState(0),
            changed: false
          });
      }
    );

    it(
      "requires confirmation again after unknown",
      () => {
        const tracker =
          new BoardStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createBoardState(0)
        );

        tracker.update(
          createBoardState(3)
        );

        tracker.update(
          createBoardState(2)
        );

        const firstFlop =
          tracker.update(
            createBoardState(3)
          );

        expect(
          firstFlop.changed
        ).toBe(false);

        const secondFlop =
          tracker.update(
            createBoardState(3)
          );

        expect(secondFlop)
          .toEqual({
            state:
              createBoardState(3),
            changed: true
          });
      }
    );

    it(
      "rejects a transient false street",
      () => {
        const tracker =
          new BoardStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createBoardState(3)
        );

        tracker.update(
          createBoardState(4)
        );

        const result =
          tracker.update(
            createBoardState(3)
          );

        expect(result)
          .toEqual({
            state:
              createBoardState(3),
            changed: false
          });
      }
    );

    it(
      "tracks flop then turn then river",
      () => {
        const tracker =
          new BoardStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createBoardState(0)
        );

        tracker.update(
          createBoardState(3)
        );

        expect(
          tracker.update(
            createBoardState(3)
          )
        ).toEqual({
          state:
            createBoardState(3),
          changed: true
        });

        tracker.update(
          createBoardState(4)
        );

        expect(
          tracker.update(
            createBoardState(4)
          )
        ).toEqual({
          state:
            createBoardState(4),
          changed: true
        });

        tracker.update(
          createBoardState(5)
        );

        expect(
          tracker.update(
            createBoardState(5)
          )
        ).toEqual({
          state:
            createBoardState(5),
          changed: true
        });
      }
    );
  }
);