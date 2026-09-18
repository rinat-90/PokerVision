import {
  describe,
  expect,
  it
} from "vitest";

import {
  detectTableEvents
} from "./table-event-detector.js";

describe(
  "detectTableEvents",
  () => {
    it(
      "detects cards appearing",
      () => {
        const events =
          detectTableEvents({
            changed: true,
            seatChanges: [
              {
                index: 2,
                previousHasCards:
                  false,
                currentHasCards:
                  true
              }
            ]
          });

        expect(events)
          .toEqual([
            {
              type:
                "cardsAppeared",
              seatIndex:
                2
            }
          ]);
      }
    );

    it(
      "detects cards disappearing",
      () => {
        const events =
          detectTableEvents({
            changed: true,
            seatChanges: [
              {
                index: 4,
                previousHasCards:
                  true,
                currentHasCards:
                  false
              }
            ]
          });

        expect(events)
          .toEqual([
            {
              type:
                "cardsDisappeared",
              seatIndex:
                4
            }
          ]);
      }
    );

    it(
      "detects multiple events",
      () => {
        const events =
          detectTableEvents({
            changed: true,
            seatChanges: [
              {
                index: 0,
                previousHasCards:
                  true,
                currentHasCards:
                  false
              },
              {
                index: 1,
                previousHasCards:
                  true,
                currentHasCards:
                  false
              },
              {
                index: 3,
                previousHasCards:
                  false,
                currentHasCards:
                  true
              }
            ]
          });

        expect(events)
          .toEqual([
            {
              type:
                "cardsDisappeared",
              seatIndex:
                0
            },
            {
              type:
                "cardsDisappeared",
              seatIndex:
                1
            },
            {
              type:
                "cardsAppeared",
              seatIndex:
                3
            }
          ]);
      }
    );

    it(
      "ignores seat appearance and disappearance",
      () => {
        const events =
          detectTableEvents({
            changed: true,
            seatChanges: [
              {
                index: 0,
                previousHasCards:
                  null,
                currentHasCards:
                  true
              },
              {
                index: 1,
                previousHasCards:
                  true,
                currentHasCards:
                  null
              }
            ]
          });

        expect(events)
          .toEqual([]);
      }
    );

    it(
      "returns no events when nothing changed",
      () => {
        const events =
          detectTableEvents({
            changed: false,
            seatChanges: []
          });

        expect(events)
          .toEqual([]);
      }
    );
  }
);