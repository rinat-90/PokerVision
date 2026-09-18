import {
  describe,
  expect,
  it
} from "vitest";

import {
  PlayerActionLabelEventDetector
} from "./player-action-label-event-detector.js";

describe(
  "PlayerActionLabelEventDetector",
  () => {
    it(
      "emits a label only once while it remains visible",
      () => {
        const detector =
          new PlayerActionLabelEventDetector();

        expect(
          detector.update([
            {
              seatIndex: 2,
              label: "check"
            }
          ])
        ).toEqual([
          {
            seatIndex: 2,
            label: "check"
          }
        ]);

        expect(
          detector.update([
            {
              seatIndex: 2,
              label: "check"
            }
          ])
        ).toEqual([]);

        expect(
          detector.update([
            {
              seatIndex: 2,
              label: "check"
            }
          ])
        ).toEqual([]);
      }
    );

    it(
      "emits the same label again after it disappears",
      () => {
        const detector =
          new PlayerActionLabelEventDetector();

        detector.update([
          {
            seatIndex: 2,
            label: "check"
          }
        ]);

        detector.update([
          {
            seatIndex: 2,
            label: null
          }
        ]);

        expect(
          detector.update([
            {
              seatIndex: 2,
              label: "check"
            }
          ])
        ).toEqual([
          {
            seatIndex: 2,
            label: "check"
          }
        ]);
      }
    );

    it(
      "emits when the label changes directly",
      () => {
        const detector =
          new PlayerActionLabelEventDetector();

        detector.update([
          {
            seatIndex: 2,
            label: "check"
          }
        ]);

        expect(
          detector.update([
            {
              seatIndex: 2,
              label: "fold"
            }
          ])
        ).toEqual([
          {
            seatIndex: 2,
            label: "fold"
          }
        ]);
      }
    );

    it(
      "tracks seats independently",
      () => {
        const detector =
          new PlayerActionLabelEventDetector();

        expect(
          detector.update([
            {
              seatIndex: 2,
              label: "fold"
            },
            {
              seatIndex: 5,
              label: "call"
            }
          ])
        ).toEqual([
          {
            seatIndex: 2,
            label: "fold"
          },
          {
            seatIndex: 5,
            label: "call"
          }
        ]);
      }
    );

    it(
      "does not emit null observations",
      () => {
        const detector =
          new PlayerActionLabelEventDetector();

        expect(
          detector.update([
            {
              seatIndex: 2,
              label: null
            }
          ])
        ).toEqual([]);
      }
    );
  }
);