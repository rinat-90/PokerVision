import { describe, expect, it } from "vitest";

import {
  createBettingState,
  applyBettingAction
} from "./betting-state.js";

import {
  createHand
} from "./create-hand.js";

import type { Player } from "./types.js";

const players: Player[] = [
  {
    id: "hero",
    name: "Hero",
    position: "BTN",
    stack: 1000,
    status: "active"
  },
  {
    id: "villain",
    name: "Villain",
    position: "BB",
    stack: 1000,
    status: "active"
  }
];

describe("betting state", () => {
  it("creates initial betting state", () => {
    const hand = createHand({
      id: "hand-1",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      players
    });

    const bettingState =
      createBettingState(hand);

    expect(
      bettingState.currentBet
    ).toBe(0);

    expect(
      bettingState.lastAggressorId
    ).toBeNull();

    expect(
      bettingState.playersToAct
    ).toEqual([
      "hero",
      "villain"
    ]);
  });

  it("tracks a bet", () => {
    const hand = createHand({
      id: "hand-1",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      players
    });

    const bettingState =
      createBettingState(hand);

    const nextState =
      applyBettingAction(
        bettingState,
        {
          playerId: "hero",
          type: "bet",
          amount: 10,
          street: "preflop"
        }
      );

    expect(
      nextState.currentBet
    ).toBe(10);

    expect(
      nextState.playerContributions.hero
    ).toBe(10);

    expect(
      nextState.lastAggressorId
    ).toBe("hero");

    expect(
      nextState.playersToAct
    ).toEqual(["villain"]);
  });

  it("tracks a call", () => {
    const hand = createHand({
      id: "hand-1",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      players
    });

    const initial =
      createBettingState(hand);

    const afterBet =
      applyBettingAction(
        initial,
        {
          playerId: "hero",
          type: "bet",
          amount: 10,
          street: "preflop"
        }
      );

    const afterCall =
      applyBettingAction(
        afterBet,
        {
          playerId: "villain",
          type: "call",
          amount: 10,
          street: "preflop"
        }
      );

    expect(
      afterCall.currentBet
    ).toBe(10);

    expect(
      afterCall.playerContributions.villain
    ).toBe(10);

    expect(
      afterCall.lastAggressorId
    ).toBe("hero");
  });
});