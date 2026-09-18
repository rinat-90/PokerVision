import {
  describe,
  expect,
  it
} from "vitest";

import type {
  TableState
} from "./table-state.js";

import {
  TableStateTracker
} from "./table-state-tracker.js";

function createState(
  hasCards: boolean
): TableState {
  return {
    seats: [
      {
        index: 0,
        hasCards
      }
    ]
  };
}

describe(
  "TableStateTracker",
  () => {
    it(
      "accepts the first state immediately",
      () => {
        const tracker =
          new TableStateTracker();

        const result =
          tracker.update(
            createState(true)
          );

        expect(
          result.state
        ).toEqual(
          createState(true)
        );

        expect(
          result.changed
        ).toBe(false);
      }
    );

    it(
      "does not accept a one-frame change",
      () => {
        const tracker =
          new TableStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createState(true)
        );

        const result =
          tracker.update(
            createState(false)
          );

        expect(
          result.state
        ).toEqual(
          createState(true)
        );

        expect(
          result.changed
        ).toBe(false);
      }
    );

    it(
      "accepts a change after enough stable frames",
      () => {
        const tracker =
          new TableStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createState(true)
        );

        tracker.update(
          createState(false)
        );

        const result =
          tracker.update(
            createState(false)
          );

        expect(
          result.state
        ).toEqual(
          createState(false)
        );

        expect(
          result.changed
        ).toBe(true);

        expect(
          result.diff.seatChanges
        ).toEqual([
          {
            index: 0,
            previousHasCards:
              true,
            currentHasCards:
              false
          }
        ]);
      }
    );

    it(
      "rejects a transient detection glitch",
      () => {
        const tracker =
          new TableStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createState(true)
        );

        tracker.update(
          createState(false)
        );

        const result =
          tracker.update(
            createState(true)
          );

        expect(
          result.state
        ).toEqual(
          createState(true)
        );

        expect(
          result.changed
        ).toBe(false);

        expect(
          result.diff.seatChanges
        ).toEqual([]);
      }
    );

    it(
      "restarts confirmation when candidate changes",
      () => {
        const tracker =
          new TableStateTracker({
            requiredStableFrames:
              2
          });

        tracker.update(
          createState(true)
        );

        tracker.update(
          createState(false)
        );

        tracker.update({
          seats: [
            {
              index: 0,
              hasCards: false
            },
            {
              index: 1,
              hasCards: true
            }
          ]
        });

        const result =
          tracker.update({
            seats: [
              {
                index: 0,
                hasCards: false
              },
              {
                index: 1,
                hasCards: true
              }
            ]
          });

        expect(
          result.changed
        ).toBe(true);

        expect(
          result.state
        ).toEqual({
          seats: [
            {
              index: 0,
              hasCards: false
            },
            {
              index: 1,
              hasCards: true
            }
          ]
        });
      }
    );
  }
);