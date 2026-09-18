import {
  describe,
  expect,
  it
} from "vitest";

import type {
  TableState
} from "./table-state.js";

import {
  diffTableStates
} from "./table-state-diff.js";

describe(
  "diffTableStates",
  () => {
    it(
      "returns no changes when states are equal",
      () => {
        const previous:
          TableState = {
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
        };

        const current:
          TableState = {
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
        };

        expect(
          diffTableStates(
            previous,
            current
          )
        ).toEqual({
          changed: false,
          seatChanges: []
        });
      }
    );

    it(
      "detects when a seat loses cards",
      () => {
        const previous:
          TableState = {
          seats: [
            {
              index: 2,
              hasCards: true
            }
          ]
        };

        const current:
          TableState = {
          seats: [
            {
              index: 2,
              hasCards: false
            }
          ]
        };

        expect(
          diffTableStates(
            previous,
            current
          )
        ).toEqual({
          changed: true,
          seatChanges: [
            {
              index: 2,
              previousHasCards:
                true,
              currentHasCards:
                false
            }
          ]
        });
      }
    );

    it(
      "detects when a seat gains cards",
      () => {
        const previous:
          TableState = {
          seats: [
            {
              index: 4,
              hasCards: false
            }
          ]
        };

        const current:
          TableState = {
          seats: [
            {
              index: 4,
              hasCards: true
            }
          ]
        };

        expect(
          diffTableStates(
            previous,
            current
          )
        ).toEqual({
          changed: true,
          seatChanges: [
            {
              index: 4,
              previousHasCards:
                false,
              currentHasCards:
                true
            }
          ]
        });
      }
    );

    it(
      "detects multiple seat changes",
      () => {
        const previous:
          TableState = {
          seats: [
            {
              index: 0,
              hasCards: true
            },
            {
              index: 1,
              hasCards: true
            },
            {
              index: 2,
              hasCards: false
            }
          ]
        };

        const current:
          TableState = {
          seats: [
            {
              index: 0,
              hasCards: false
            },
            {
              index: 1,
              hasCards: true
            },
            {
              index: 2,
              hasCards: true
            }
          ]
        };

        expect(
          diffTableStates(
            previous,
            current
          )
        ).toEqual({
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
              index: 2,
              previousHasCards:
                false,
              currentHasCards:
                true
            }
          ]
        });
      }
    );

    it(
      "detects when a seat appears",
      () => {
        const previous:
          TableState = {
          seats: [
            {
              index: 0,
              hasCards: false
            }
          ]
        };

        const current:
          TableState = {
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
        };

        expect(
          diffTableStates(
            previous,
            current
          )
        ).toEqual({
          changed: true,
          seatChanges: [
            {
              index: 1,
              previousHasCards:
                null,
              currentHasCards:
                true
            }
          ]
        });
      }
    );

    it(
      "detects when a seat disappears",
      () => {
        const previous:
          TableState = {
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
        };

        const current:
          TableState = {
          seats: [
            {
              index: 0,
              hasCards: false
            }
          ]
        };

        expect(
          diffTableStates(
            previous,
            current
          )
        ).toEqual({
          changed: true,
          seatChanges: [
            {
              index: 1,
              previousHasCards:
                true,
              currentHasCards:
                null
            }
          ]
        });
      }
    );

  }
);