import {
  describe,
  expect,
  it
} from "vitest";

import {
  createPlayerActionContext
} from "./player-action-context.js";

describe(
  "createPlayerActionContext",
  () => {
    it(
      "calculates amount to call",
      () => {
        const context =
          createPlayerActionContext({
            seatIndex: 4,
            street: "preflop",
            previousAmount: 600,
            currentAmount: 1900,
            highestAmount: 1200,
            chipPresent: true
          });

        expect(
          context.amountToCall
        ).toBe(600);
      }
    );

    it(
      "uses zero when player has no previous amount",
      () => {
        const context =
          createPlayerActionContext({
            seatIndex: 4,
            street: "flop",
            previousAmount: null,
            currentAmount: 600,
            highestAmount: 600,
            chipPresent: true
          });

        expect(
          context.amountToCall
        ).toBe(600);
      }
    );

    it(
      "never returns a negative amount to call",
      () => {
        const context =
          createPlayerActionContext({
            seatIndex: 4,
            street: "turn",
            previousAmount: 1900,
            currentAmount: 1900,
            highestAmount: 1200,
            chipPresent: true
          });

        expect(
          context.amountToCall
        ).toBe(0);
      }
    );
  }
);