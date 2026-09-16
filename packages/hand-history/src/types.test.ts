import {
  describe,
  expect,
  it
} from "vitest";

import type {
  HandHistory
} from "./types.js";

describe("HandHistory types", () => {
  it("creates a basic hand history", () => {
    const hand: HandHistory = {
      id: "hand-1",
      gameFormat: "cash",

      smallBlind: 1,
      bigBlind: 2,
      ante: 0,

      players: [
        {
          id: "hero",
          name: "Hero",
          position: "BTN",
          startingStack: 200
        },
        {
          id: "villain",
          name: "Villain",
          position: "BB",
          startingStack: 200
        }
      ],

      streets: [
        {
          street: "preflop",
          board: [],
          actions: [
            {
              playerId: "hero",
              type: "raise",
              amount: 6,
              amountType: "total",
              street: "preflop"
            },
            {
              playerId: "villain",
              type: "call",
              amount: 4,
              amountType: "contribution",
              street: "preflop"
            }
          ]
        }
      ]
    };

    expect(hand.id).toBe("hand-1");
    expect(hand.players).toHaveLength(2);
    expect(hand.streets).toHaveLength(1);

    expect(
      hand.streets[0]?.actions[0]?.amountType
    ).toBe("total");

    expect(
      hand.streets[0]?.actions[1]?.amountType
    ).toBe("contribution");
  });
});