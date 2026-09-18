import {
  describe,
  expect,
  it
} from "vitest";

import type {
  LiveTableStateResult
} from "./live-table-state-processor.js";

import {
  LiveHandTracker
} from "./live-hand-tracker.js";

function result(
  timestampSeconds: number,
  activeSeatIndexes: number[],
  lifecycleEvents:
  LiveTableStateResult[
    "lifecycleEvents"
    ] = []
): LiveTableStateResult {
  return {
    timestampSeconds,

    state: {
      seats: Array.from(
        {
          length: 6
        },
        (_, index) => ({
          index,
          hasCards:
            activeSeatIndexes.includes(
              index
            )
        })
      )
    },

    lifecycleEvents
  };
}

describe(
  "LiveHandTracker",
  () => {
    it(
      "starts a hand from a handStarted event",
      () => {
        const tracker =
          new LiveHandTracker();

        const tracked =
          tracker.update(
            result(
              10,
              [
                0,
                2,
                5
              ],
              [
                {
                  type:
                    "handStarted",

                  activeSeatIndexes: [
                    0,
                    2,
                    5
                  ]
                }
              ]
            )
          );

        expect(
          tracked.handActive
        ).toBe(true);

        expect(
          tracked.completedHand
        ).toBeNull();

        expect(
          tracker.isHandActive()
        ).toBe(true);
      }
    );

    it(
      "does not complete a hand from intermediate seat changes",
      () => {
        const tracker =
          new LiveHandTracker();

        tracker.update(
          result(
            10,
            [
              0,
              2,
              5
            ],
            [
              {
                type:
                  "handStarted",

                activeSeatIndexes: [
                  0,
                  2,
                  5
                ]
              }
            ]
          )
        );

        const tracked =
          tracker.update(
            result(
              20,
              [
                0,
                5
              ]
            )
          );

        expect(
          tracked.handActive
        ).toBe(true);

        expect(
          tracked.completedHand
        ).toBeNull();
      }
    );

    it(
      "completes the active hand on handEnded",
      () => {
        const tracker =
          new LiveHandTracker();

        tracker.update(
          result(
            10,
            [
              0,
              2,
              5
            ],
            [
              {
                type:
                  "handStarted",

                activeSeatIndexes: [
                  0,
                  2,
                  5
                ]
              }
            ]
          )
        );

        const tracked =
          tracker.update(
            result(
              37.5,
              [],
              [
                {
                  type:
                    "handEnded",

                  activeSeatIndexes: []
                }
              ]
            )
          );

        expect(
          tracked.handActive
        ).toBe(false);

        expect(
          tracked.completedHand
        ).toEqual({
          startedAt: 10,
          completedAt: 37.5,

          players: [
            {
              seatIndex: 0,
              hasCards: true
            },
            {
              seatIndex: 2,
              hasCards: true
            },
            {
              seatIndex: 5,
              hasCards: true
            }
          ],

          streets: [],
          actions: []
        });
      }
    );

    it(
      "ignores handEnded when no hand is active",
      () => {
        const tracker =
          new LiveHandTracker();

        const tracked =
          tracker.update(
            result(
              10,
              [],
              [
                {
                  type:
                    "handEnded",

                  activeSeatIndexes: []
                }
              ]
            )
          );

        expect(
          tracked.handActive
        ).toBe(false);

        expect(
          tracked.completedHand
        ).toBeNull();
      }
    );

    it(
      "can track consecutive hands",
      () => {
        const tracker =
          new LiveHandTracker();

        tracker.update(
          result(
            10,
            [
              0,
              2
            ],
            [
              {
                type:
                  "handStarted",

                activeSeatIndexes: [
                  0,
                  2
                ]
              }
            ]
          )
        );

        const first =
          tracker.update(
            result(
              20,
              [],
              [
                {
                  type:
                    "handEnded",

                  activeSeatIndexes: []
                }
              ]
            )
          );

        tracker.update(
          result(
            25,
            [
              1,
              5
            ],
            [
              {
                type:
                  "handStarted",

                activeSeatIndexes: [
                  1,
                  5
                ]
              }
            ]
          )
        );

        const second =
          tracker.update(
            result(
              40,
              [],
              [
                {
                  type:
                    "handEnded",

                  activeSeatIndexes: []
                }
              ]
            )
          );

        expect(
          first.completedHand
            ?.startedAt
        ).toBe(10);

        expect(
          first.completedHand
            ?.completedAt
        ).toBe(20);

        expect(
          second.completedHand
            ?.startedAt
        ).toBe(25);

        expect(
          second.completedHand
            ?.completedAt
        ).toBe(40);

        expect(
          second.completedHand
            ?.players
        ).toEqual([
          {
            seatIndex: 1,
            hasCards: true
          },
          {
            seatIndex: 5,
            hasCards: true
          }
        ]);
      }
    );

    it(
      "builds a partial hand when live tracking starts mid-hand",
      () => {
        const tracker =
          new LiveHandTracker();

        const initial =
          tracker.update(
            result(
              0,
              [
                0,
                2,
                5
              ]
            )
          );

        expect(
          initial.handActive
        ).toBe(true);

        expect(
          initial.completedHand
        ).toBeNull();

        const completed =
          tracker.update(
            result(
              37.5,
              [],
              [
                {
                  type:
                    "handEnded",

                  activeSeatIndexes: []
                }
              ]
            )
          );

        expect(
          completed.completedHand
        ).toEqual({
          startedAt: null,
          completedAt: 37.5,

          players: [
            {
              seatIndex: 0,
              hasCards: true
            },
            {
              seatIndex: 2,
              hasCards: true
            },
            {
              seatIndex: 5,
              hasCards: true
            }
          ],

          streets: [],
          actions: []
        });

        expect(
          completed.handActive
        ).toBe(false);
      }
    );
  }
);