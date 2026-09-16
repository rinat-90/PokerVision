import {
  describe,
  expect,
  it
} from "vitest";

import {
  createHand
} from "./create-hand.js";

import {
  startHand
} from "./start-hand.js";

import type {
  Player
} from "./types.js";

describe("startHand", () => {
  it("posts blinds and starts preflop action", () => {
    const players: Player[] = [
      {
        id: "utg",
        name: "UTG",
        position: "UTG",
        stack: 100,
        status: "active"
      },
      {
        id: "co",
        name: "CO",
        position: "CO",
        stack: 100,
        status: "active"
      },
      {
        id: "btn",
        name: "BTN",
        position: "BTN",
        stack: 100,
        status: "active"
      },
      {
        id: "sb",
        name: "SB",
        position: "SB",
        stack: 100,
        status: "active"
      },
      {
        id: "bb",
        name: "BB",
        position: "BB",
        stack: 100,
        status: "active"
      }
    ];

    const hand = createHand({
      id: "hand-1",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      players
    });

    const started =
      startHand(hand);

    expect(started.pot).toBe(3);

    expect(
      started.currentBet
    ).toBe(2);

    expect(
      started.currentPlayerId
    ).toBe("utg");

    expect(
      started.playerContributions.sb
    ).toBe(1);

    expect(
      started.playerContributions.bb
    ).toBe(2);

    expect(
      started.players.find(
        (player) =>
          player.id === "sb"
      )?.stack
    ).toBe(99);

    expect(
      started.players.find(
        (player) =>
          player.id === "bb"
      )?.stack
    ).toBe(98);

    expect(
      started.actions
    ).toHaveLength(2);
  });

  it("starts heads-up with BTN as small blind", () => {
    const players: Player[] = [
      {
        id: "btn",
        name: "BTN",
        position: "BTN",
        stack: 100,
        status: "active"
      },
      {
        id: "bb",
        name: "BB",
        position: "BB",
        stack: 100,
        status: "active"
      }
    ];

    const hand = createHand({
      id: "heads-up",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      players
    });

    const started =
      startHand(hand);

    expect(
      started.playerContributions.btn
    ).toBe(1);

    expect(
      started.playerContributions.bb
    ).toBe(2);

    expect(
      started.pot
    ).toBe(3);

    // BB acts first preflop heads-up.
    expect(
      started.currentPlayerId
    ).toBe("bb");
  });

  it("skips inactive players", () => {
    const players: Player[] = [
      {
        id: "utg",
        name: "UTG",
        position: "UTG",
        stack: 100,
        status: "folded"
      },
      {
        id: "co",
        name: "CO",
        position: "CO",
        stack: 100,
        status: "active"
      },
      {
        id: "btn",
        name: "BTN",
        position: "BTN",
        stack: 100,
        status: "active"
      },
      {
        id: "sb",
        name: "SB",
        position: "SB",
        stack: 100,
        status: "active"
      },
      {
        id: "bb",
        name: "BB",
        position: "BB",
        stack: 100,
        status: "active"
      }
    ];

    const hand = createHand({
      id: "hand-2",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      players
    });

    const started =
      startHand(hand);

    expect(
      started.currentPlayerId
    ).toBe("co");
  });
});