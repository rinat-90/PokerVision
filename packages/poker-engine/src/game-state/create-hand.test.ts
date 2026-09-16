import {
  describe,
  expect,
  it
} from "vitest";

import {
  createHand
} from "./create-hand.js";

import type {
  Player
} from "./types.js";

const players: Player[] = [
  {
    id: "hero",
    name: "Hero",
    position: "BTN",
    stack: 200,
    status: "active"
  },
  {
    id: "villain",
    name: "Villain",
    position: "BB",
    stack: 200,
    status: "active"
  }
];

describe("createHand", () => {
  it("creates a new hand", () => {
    const hand =
      createHand({
        id: "hand-1",
        gameFormat: "cash",
        smallBlind: 1,
        bigBlind: 2,
        players
      });

    expect(hand.id)
      .toBe("hand-1");

    expect(hand.street)
      .toBe("preflop");

    expect(hand.pot)
      .toBe(0);

    expect(hand.board)
      .toHaveLength(0);

    expect(hand.actions)
      .toHaveLength(0);

    expect(hand.players)
      .toHaveLength(2);
  });

  it("rejects a hand with one player", () => {
    expect(() =>
      createHand({
        id: "hand-1",
        gameFormat: "cash",
        smallBlind: 1,
        bigBlind: 2,
        players: [players[0]!]
      })
    ).toThrow(
      "A hand requires at least two players"
    );
  });
});