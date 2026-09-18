import {
  describe,
  expect,
  it
} from "vitest";

import {
  BetAmountStateTracker
} from "./bet-amount-state-tracker.js";

describe(
  "BetAmountStateTracker",
  () => {
    it(
      "requires stable frames before appearance",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        expect(
          tracker.update([
            {
              seatIndex: 4,
              hasAmount: false,
                confidence: 0
            }
          ]).changes
        ).toEqual([]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              hasAmount: true,
                confidence: 0
            },
          ]).changes
        ).toEqual([]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              hasAmount: true,
                confidence: 0
            }
          ]).changes
        ).toEqual([
          {
            seatIndex: 4,
            hasAmount: true,
            confidence: 0
          }
        ]);
      }
    );

    it(
      "requires stable frames before disappearance",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        tracker.update([
          {
            seatIndex: 4,
            hasAmount: false,
              confidence: 0
          }
        ]);

        tracker.update([
          {
            seatIndex: 4,
            hasAmount: true,
              confidence: 0
          }
        ]);

        tracker.update([
          {
            seatIndex: 4,
            hasAmount: true,
              confidence: 0
          }
        ]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              hasAmount: false,
                confidence: 0
            }
          ]).changes
        ).toEqual([]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              hasAmount: false,
                confidence: 0
            }
          ]).changes
        ).toEqual([
          {
            seatIndex: 4,
            hasAmount: false,
            confidence: 0
          }
        ]);
      }
    );

    it(
      "tracks seats independently",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        tracker.update([
          {
            seatIndex: 4,
            hasAmount: false,
              confidence: 0
          },
          {
            seatIndex: 5,
            hasAmount: false,
              confidence: 0
          }
        ]);

        tracker.update([
          {
            seatIndex: 4,
            hasAmount: true,
              confidence: 0,
          },
          {
            seatIndex: 5,
            hasAmount: false,
              confidence: 0,
          }
        ]);

        const result =
          tracker.update([
            {
              seatIndex: 4,
              hasAmount: true,
                confidence: 0,
            },
            {
              seatIndex: 5,
              hasAmount: true,
                confidence: 0,
            }
          ]);

        expect(
          result.changes
        ).toEqual([
          {
            seatIndex: 4,
            hasAmount: true,
            confidence: 0,
          }
        ]);
      }
    );

    it(
      "does not emit repeated changes",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        tracker.update([
          {
            seatIndex: 4,
            hasAmount: false,
            confidence: 0
          }
        ]);

        tracker.update([
          {
            seatIndex: 4,
            hasAmount: true,
              confidence: 0
          }
        ]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              hasAmount: true,
                confidence: 0
            }
          ]).changes
        ).toHaveLength(1);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              hasAmount: true,
                confidence: 0
            }
          ]).changes
        ).toEqual([]);
      }
    );
  }
);