import {
  describe,
  expect,
  it
} from "vitest";

import {
  HandLifecycleDetector
} from "./hand-lifecycle-detector.js";

import type {
  TableState
} from "./table-state.js";

function createState(
  activeSeatIndexes: number[]
): TableState {
  return {
    seats:
      Array.from(
        {
          length: 6
        },
        (
          _,
          index
        ) => ({
          index,
          hasCards:
            activeSeatIndexes.includes(
              index
            )
        })
      )
  };
}

describe(
  "HandLifecycleDetector",
  () => {
    it(
      "does not emit an event for the initial state",
      () => {
        const detector =
          new HandLifecycleDetector();

        const events =
          detector.update(
            createState([
              0,
              1,
              2,
              4,
              5
            ])
          );

        expect(events)
          .toEqual([]);
      }
    );

    it(
      "detects a hand starting",
      () => {
        const detector =
          new HandLifecycleDetector();

        detector.update(
          createState([])
        );

        const events =
          detector.update(
            createState([
              0,
              1,
              2,
              4,
              5
            ])
          );

        expect(events)
          .toEqual([
            {
              type:
                "handStarted",
              activeSeatIndexes: [
                0,
                1,
                2,
                4,
                5
              ]
            }
          ]);
      }
    );

    it(
      "does not start a hand with only one active seat",
      () => {
        const detector =
          new HandLifecycleDetector();

        detector.update(
          createState([])
        );

        const events =
          detector.update(
            createState([
              2
            ])
          );

        expect(events)
          .toEqual([]);
      }
    );

    it(
      "does not end the hand when some players lose cards",
      () => {
        const detector =
          new HandLifecycleDetector();

        detector.update(
          createState([
            0,
            1,
            2,
            4,
            5
          ])
        );

        const events =
          detector.update(
            createState([
              2,
              4,
              5
            ])
          );

        expect(events)
          .toEqual([]);
      }
    );

    it(
      "does not end the hand when only one player remains",
      () => {
        const detector =
          new HandLifecycleDetector();

        detector.update(
          createState([
            0,
            1,
            2
          ])
        );

        const events =
          detector.update(
            createState([
              2
            ])
          );

        expect(events)
          .toEqual([]);
      }
    );

    it(
      "detects a hand ending when all cards disappear",
      () => {
        const detector =
          new HandLifecycleDetector();

        detector.update(
          createState([
            4,
            5
          ])
        );

        const events =
          detector.update(
            createState([])
          );

        expect(events)
          .toEqual([
            {
              type:
                "handEnded",
              activeSeatIndexes:
                []
            }
          ]);
      }
    );

    it(
      "does not repeatedly emit hand ended",
      () => {
        const detector =
          new HandLifecycleDetector();

        detector.update(
          createState([
            4,
            5
          ])
        );

        detector.update(
          createState([])
        );

        const events =
          detector.update(
            createState([])
          );

        expect(events)
          .toEqual([]);
      }
    );

    it(
      "supports a custom minimum player count",
      () => {
        const detector =
          new HandLifecycleDetector({
            minPlayers: 3
          });

        detector.update(
          createState([])
        );

        expect(
          detector.update(
            createState([
              0,
              1
            ])
          )
        ).toEqual([]);

        expect(
          detector.update(
            createState([
              0,
              1,
              2
            ])
          )
        ).toEqual([
          {
            type:
              "handStarted",
            activeSeatIndexes: [
              0,
              1,
              2
            ]
          }
        ]);
      }
    );
  }
);