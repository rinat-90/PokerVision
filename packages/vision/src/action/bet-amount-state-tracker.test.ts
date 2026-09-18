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
      "requires stable frames before amount appears",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        expect(
          tracker.update([
            {
              seatIndex: 4,
              amount: null,
              rawText: null,
              confidence: 0
            }
          ]).changes
        ).toEqual([]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              amount: 600,
              rawText: "600",
              confidence: 0.4
            }
          ]).changes
        ).toEqual([]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              amount: 600,
              rawText: "600",
              confidence: 0.5
            }
          ]).changes
        ).toEqual([
          {
            seatIndex: 4,
            previousAmount: null,
            currentAmount: 600,
            confidence: 0.5
          }
        ]);
      }
    );

    it(
      "requires stable frames before amount disappears",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        tracker.update([
          {
            seatIndex: 4,
            amount: 600,
            rawText: "600",
            confidence: 0.5
          }
        ]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              amount: null,
              rawText: null,
              confidence: 0
            }
          ]).changes
        ).toEqual([]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              amount: null,
              rawText: null,
              confidence: 0
            }
          ]).changes
        ).toEqual([
          {
            seatIndex: 4,
            previousAmount: 600,
            currentAmount: null,
            confidence: 0
          }
        ]);
      }
    );

    it(
      "detects stable amount changes",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        tracker.update([
          {
            seatIndex: 4,
            amount: 600,
            rawText: "600",
            confidence: 0.5
          }
        ]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              amount: 1900,
              rawText: "1,900",
              confidence: 0
            }
          ]).changes
        ).toEqual([]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              amount: 1900,
              rawText: "1,900",
              confidence: 0
            }
          ]).changes
        ).toEqual([
          {
            seatIndex: 4,
            previousAmount: 600,
            currentAmount: 1900,
            confidence: 0
          }
        ]);
      }
    );

    it(
      "ignores a single OCR miss",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        tracker.update([
          {
            seatIndex: 4,
            amount: 600,
            rawText: "600",
            confidence: 0.5
          }
        ]);

        const missed =
          tracker.update([
            {
              seatIndex: 4,
              amount: null,
              rawText: null,
              confidence: 0
            }
          ]);

        expect(
          missed.changes
        ).toEqual([]);

        expect(
          missed.stable[0]?.amount
        ).toBe(600);

        const recovered =
          tracker.update([
            {
              seatIndex: 4,
              amount: 600,
              rawText: "600",
              confidence: 0.4
            }
          ]);

        expect(
          recovered.changes
        ).toEqual([]);

        expect(
          recovered.stable[0]?.amount
        ).toBe(600);
      }
    );

    it(
      "ignores a single incorrect OCR amount",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        tracker.update([
          {
            seatIndex: 4,
            amount: 600,
            rawText: "600",
            confidence: 0.5
          }
        ]);

        const noisy =
          tracker.update([
            {
              seatIndex: 4,
              amount: 800,
              rawText: "800",
              confidence: 0.9
            }
          ]);

        expect(
          noisy.changes
        ).toEqual([]);

        expect(
          noisy.stable[0]?.amount
        ).toBe(600);

        const recovered =
          tracker.update([
            {
              seatIndex: 4,
              amount: 600,
              rawText: "600",
              confidence: 0
            }
          ]);

        expect(
          recovered.changes
        ).toEqual([]);

        expect(
          recovered.stable[0]?.amount
        ).toBe(600);
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
            amount: null,
            rawText: null,
            confidence: 0
          },
          {
            seatIndex: 5,
            amount: null,
            rawText: null,
            confidence: 0
          }
        ]);

        tracker.update([
          {
            seatIndex: 4,
            amount: 600,
            rawText: "600",
            confidence: 0.5
          },
          {
            seatIndex: 5,
            amount: null,
            rawText: null,
            confidence: 0
          }
        ]);

        const result =
          tracker.update([
            {
              seatIndex: 4,
              amount: 600,
              rawText: "600",
              confidence: 0.6
            },
            {
              seatIndex: 5,
              amount: 200,
              rawText: "200",
              confidence: 0.9
            }
          ]);

        expect(
          result.changes
        ).toEqual([
          {
            seatIndex: 4,
            previousAmount: null,
            currentAmount: 600,
            confidence: 0.6
          }
        ]);

        expect(
          result.stable.find(
            state =>
              state.seatIndex === 5
          )?.amount
        ).toBeNull();
      }
    );

    it(
      "does not emit repeated changes for the same amount",
      () => {
        const tracker =
          new BetAmountStateTracker({
            requiredStableFrames: 2
          });

        tracker.update([
          {
            seatIndex: 4,
            amount: null,
            rawText: null,
            confidence: 0
          }
        ]);

        tracker.update([
          {
            seatIndex: 4,
            amount: 5700,
            rawText: "5,700",
            confidence: 0.2
          }
        ]);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              amount: 5700,
              rawText: "5,700",
              confidence: 0.3
            }
          ]).changes
        ).toHaveLength(1);

        expect(
          tracker.update([
            {
              seatIndex: 4,
              amount: 5700,
              rawText: "5,700",
              confidence: 0.4
            }
          ]).changes
        ).toEqual([]);
      }
    );
  }
);