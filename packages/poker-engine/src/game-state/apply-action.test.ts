import { describe, expect, it } from "vitest";

import {
  applyAction,
  createHand,
  startHand,
  type Player
} from "./index.js";

function createTestHand() {
  const players: Player[] = [
    {
      id: "hero",
      name: "Hero",
      position: "UTG",
      stack: 100,
      status: "active"
    },
    {
      id: "villain",
      name: "Villain",
      position: "BTN",
      stack: 100,
      status: "active"
    },
    {
      id: "sb",
      name: "Small Blind",
      position: "SB",
      stack: 100,
      status: "active"
    },
    {
      id: "bb",
      name: "Big Blind",
      position: "BB",
      stack: 100,
      status: "active"
    }
  ];

  const hand = createHand({
    id: "test-hand",
    gameFormat: "cash",
    smallBlind: 1,
    bigBlind: 2,
    players
  });

  return startHand(hand);
}

function createHeadsUpHand() {
  const players: Player[] = [
    {
      id: "hero",
      name: "Hero",
      position: "BB",
      stack: 100,
      status: "active"
    },
    {
      id: "villain",
      name: "Villain",
      position: "BTN",
      stack: 100,
      status: "active"
    }
  ];

  const hand = createHand({
    id: "heads-up-test",
    gameFormat: "cash",
    smallBlind: 1,
    bigBlind: 2,
    players
  });

  return startHand(hand);
}

describe("applyAction", () => {
  it("applies a raise", () => {
    const state = createTestHand();

    expect(state.currentPlayerId).toBe("hero");

    const nextState = applyAction(state, {
      playerId: "hero",
      type: "raise",
      amount: 20,
      street: "preflop"
    });

    expect(
      nextState.playerContributions.hero
    ).toBe(20);

    expect(nextState.pot).toBe(23);

    expect(nextState.currentBet).toBe(20);

    expect(
      nextState.players.find(
        (player) => player.id === "hero"
      )?.stack
    ).toBe(80);
  });

  it("applies a call", () => {
    const state = createTestHand();

    expect(state.currentPlayerId).toBe("hero");

    const nextState = applyAction(state, {
      playerId: "hero",
      type: "call",
      amount: 2,
      street: "preflop"
    });

    expect(
      nextState.playerContributions.hero
    ).toBe(2);

    expect(nextState.pot).toBe(5);

    expect(
      nextState.players.find(
        (player) => player.id === "hero"
      )?.stack
    ).toBe(98);
  });

  it("moves the turn to the next active player", () => {
    const state = createTestHand();

    expect(state.currentPlayerId).toBe("hero");

    const nextState = applyAction(state, {
      playerId: "hero",
      type: "call",
      amount: 2,
      street: "preflop"
    });

    expect(
      nextState.currentPlayerId
    ).toBe("villain");
  });

  it("marks a player as folded", () => {
    const state = createHeadsUpHand();

    expect(state.currentPlayerId).toBe("hero");

    const nextState = applyAction(state, {
      playerId: "hero",
      type: "fold",
      amount: 0,
      street: "preflop"
    });

    expect(
      nextState.players.find(
        (player) => player.id === "hero"
      )?.status
    ).toBe("folded");

    expect(
      nextState.currentPlayerId
    ).toBeNull();

    expect(
      nextState.bettingRoundComplete
    ).toBe(true);
  });

  it("marks a player all-in", () => {
    const state = createTestHand();

    expect(state.currentPlayerId).toBe("hero");

    const nextState = applyAction(state, {
      playerId: "hero",
      type: "all_in",
      amount: 100,
      street: "preflop"
    });

    expect(
      nextState.players.find(
        (player) => player.id === "hero"
      )?.stack
    ).toBe(0);

    expect(
      nextState.players.find(
        (player) => player.id === "hero"
      )?.status
    ).toBe("all_in");

    expect(nextState.pot).toBe(103);
  });

  it("rejects an action from the wrong player", () => {
    const state = createTestHand();

    expect(state.currentPlayerId).toBe("hero");

    expect(() =>
      applyAction(state, {
        playerId: "villain",
        type: "raise",
        amount: 10,
        street: "preflop"
      })
    ).toThrow("It is not villain's turn");
  });

  it("rejects a negative action amount", () => {
    const state = createTestHand();

    expect(() =>
      applyAction(state, {
        playerId: "hero",
        type: "call",
        amount: -1,
        street: "preflop"
      })
    ).toThrow(
      "Action amount cannot be negative"
    );
  });

  it("rejects an action larger than the player's stack", () => {
    const state = createTestHand();

    expect(() =>
      applyAction(state, {
        playerId: "hero",
        type: "raise",
        amount: 101,
        street: "preflop"
      })
    ).toThrow(
      "Player does not have enough chips"
    );
  });

  it("removes an all-in player from future actions", () => {
    const state = createTestHand();

    const result = applyAction(
      state,
      {
        playerId: "hero",
        type: "all_in",
        amount: 100,
        street: "preflop"
      }
    );

    expect(
      result.players.find(
        (player) => player.id === "hero"
      )?.status
    ).toBe("all_in");

    expect(
      result.playersToAct
    ).not.toContain("hero");
  });

  it("finishes the betting round when the remaining players call an all-in", () => {
    const state = createTestHand();

    const heroAllIn = applyAction(
      state,
      {
        playerId: "hero",
        type: "all_in",
        amount: 100,
        street: "preflop"
      }
    );

    const villainContribution =
      heroAllIn.playerContributions["villain"] ?? 0;

    const villainCallAmount =
      heroAllIn.currentBet -
      villainContribution;

    const villainCall = applyAction(
      heroAllIn,
      {
        playerId: "villain",
        type: "call",
        amount: villainCallAmount,
        street: "preflop"
      }
    );

    const sbContribution =
      villainCall.playerContributions["sb"] ?? 0;

    const sbCallAmount =
      villainCall.currentBet -
      sbContribution;

    const sbCall = applyAction(
      villainCall,
      {
        playerId: "sb",
        type: "call",
        amount: sbCallAmount,
        street: "preflop"
      }
    );

    const bbContribution =
      sbCall.playerContributions["bb"] ?? 0;

    const bbCallAmount =
      sbCall.currentBet -
      bbContribution;

    const bbCall = applyAction(
      sbCall,
      {
        playerId: "bb",
        type: "call",
        amount: bbCallAmount,
        street: "preflop"
      }
    );

    expect(
      bbCall.playersToAct
    ).toEqual([]);

    expect(
      bbCall.currentPlayerId
    ).toBeNull();

    expect(
      bbCall.bettingRoundComplete
    ).toBe(true);
  });

});