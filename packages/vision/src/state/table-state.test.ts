import {
  describe,
  expect,
  it
} from "vitest";

import type {
  DetectedSeat
} from "../seat/seat-detector.js";

import {
  createTableState
} from "./table-state.js";

describe(
  "createTableState",
  () => {
    it(
      "creates poker table state from detected seats",
      () => {
        const detectedSeats:
          DetectedSeat[] = [
          {
            index: 0,
            region: {
              index: 0,
              x: 100,
              y: 100,
              width: 200,
              height: 100
            },
            hasCards: true,
            cardRegions: [
              {
                x: 20,
                y: 10,
                width: 120,
                height: 55
              }
            ],
            confidence: 0.5
          },
          {
            index: 1,
            region: {
              index: 1,
              x: 300,
              y: 100,
              width: 200,
              height: 100
            },
            hasCards: false,
            cardRegions: [],
            confidence: 0
          }
        ];

        const state =
          createTableState(
            detectedSeats
          );

        expect(state)
          .toEqual({
            seats: [
              {
                index: 0,
                hasCards: true
              },
              {
                index: 1,
                hasCards: false
              }
            ]
          });
      }
    );
  }
);