import {
  describe,
  expect,
  it
} from "vitest";

import {
  SeatBetStateTracker
} from "./seat-bet-state-tracker.js";

describe(
  "SeatBetStateTracker",
  () => {
    it(
      "uses first observation as stable state",
      () => {
        const tracker =
          new SeatBetStateTracker();

        expect(
          tracker.update(false)
        ).toEqual({
          hasBet: false,
          changed: false
        });
      }
    );

    it(
      "stabilizes bet appearance",
      () => {
        const tracker =
          new SeatBetStateTracker();

        tracker.update(false);

        expect(
          tracker.update(true)
        ).toEqual({
          hasBet: false,
          changed: false
        });

        expect(
          tracker.update(true)
        ).toEqual({
          hasBet: true,
          changed: true
        });
      }
    );

    it(
      "stabilizes bet clearing",
      () => {
        const tracker =
          new SeatBetStateTracker();

        tracker.update(true);

        tracker.update(false);

        expect(
          tracker.update(false)
        ).toEqual({
          hasBet: false,
          changed: true
        });
      }
    );

    it(
      "ignores one-frame noise",
      () => {
        const tracker =
          new SeatBetStateTracker();

        tracker.update(false);

        tracker.update(true);

        expect(
          tracker.update(false)
        ).toEqual({
          hasBet: false,
          changed: false
        });
      }
    );

    it(
      "supports one-frame stabilization",
      () => {
        const tracker =
          new SeatBetStateTracker({
            stableFrames: 1
          });

        tracker.update(false);

        expect(
          tracker.update(true)
        ).toEqual({
          hasBet: true,
          changed: true
        });
      }
    );
  }
);