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
    id: "rules-test",
    gameFormat: "cash",
    smallBlind: 1,
    bigBlind: 2,
    players
  });

  return startHand(hand);
}

describe("betting rules", () => {
  it("starts with the correct preflop player", () => {
    const state = createTestHand();

    expect(state.currentPlayerId).toBe("hero");
  });

  it("starts with the correct blinds", () => {
    const state = createTestHand();

    expect(
      state.playerContributions.sb
    ).toBe(1);

    expect(
      state.playerContributions.bb
    ).toBe(2);

    expect(state.pot).toBe(3);

    expect(state.currentBet).toBe(2);
  });

  it("allows a player to raise", () => {
    const state = createTestHand();

    expect(state.currentPlayerId).toBe("hero");

    const nextState = applyAction(state, {
      playerId: "hero",
      type: "raise",
      amount: 10,
      street: "preflop"
    });

    expect(
      nextState.playerContributions.hero
    ).toBe(10);

    expect(nextState.currentBet).toBe(10);

    expect(nextState.pot).toBe(13);
  });

  it("rejects a bet when a bet already exists", () => {
    const state = createTestHand();

    expect(state.currentBet).toBe(2);

    expect(() =>
      applyAction(state, {
        playerId: "hero",
        type: "bet",
        amount: 10,
        street: "preflop"
      })
    ).toThrow(
      "Cannot bet when a bet already exists"
    );
  });

  it("rejects check when facing a bet", () => {
    const state = createTestHand();

    expect(state.currentBet).toBe(2);

    expect(() =>
      applyAction(state, {
        playerId: "hero",
        type: "check",
        amount: 0,
        street: "preflop"
      })
    ).toThrow(
      "Cannot check when facing a bet"
    );
  });

  it("allows a call", () => {
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
  });

  it("rejects a call with the wrong amount", () => {
    const state = createTestHand();

    expect(() =>
      applyAction(state, {
        playerId: "hero",
        type: "call",
        amount: 1,
        street: "preflop"
      })
    ).toThrow("Call requires 2");
  });

  it("requires the small blind to call the remaining amount", () => {
    const state = createTestHand();

    const afterHeroCall = applyAction(
      state,
      {
        playerId: "hero",
        type: "call",
        amount: 2,
        street: "preflop"
      }
    );

    const afterVillainCall = applyAction(
      afterHeroCall,
      {
        playerId: "villain",
        type: "call",
        amount: 2,
        street: "preflop"
      }
    );

    expect(
      afterVillainCall.currentPlayerId
    ).toBe("sb");

    expect(() =>
      applyAction(afterVillainCall, {
        playerId: "sb",
        type: "call",
        amount: 0,
        street: "preflop"
      })
    ).toThrow("Call requires 1");
  });

  it("rejects an undersized raise", () => {
    const state = createTestHand();

    expect(state.currentBet).toBe(2);

    expect(state.minimumRaise).toBe(2);

    expect(() =>
      applyAction(state, {
        playerId: "hero",
        type: "raise",
        amount: 3,
        street: "preflop"
      })
    ).toThrow(
      "Minimum raise requires total contribution of 4"
    );
  });

  it("allows a minimum raise", () => {
    const state = createTestHand();

    const nextState = applyAction(state, {
      playerId: "hero",
      type: "raise",
      amount: 4,
      street: "preflop"
    });

    expect(
      nextState.playerContributions.hero
    ).toBe(4);

    expect(nextState.currentBet).toBe(4);
  });

  it("rejects a negative amount", () => {
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

  it("rejects an action larger than the stack", () => {
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

  it("rejects action from the wrong player", () => {
    const state = createTestHand();

    expect(
      state.currentPlayerId
    ).toBe("hero");

    expect(() =>
      applyAction(state, {
        playerId: "villain",
        type: "raise",
        amount: 10,
        street: "preflop"
      })
    ).toThrow(
      "It is not villain's turn"
    );
  });

  it("rejects action from a folded player", () => {
    const state = createTestHand();

    const foldedState = {
      ...state,
      currentPlayerId: "hero",
      players: state.players.map(
        (player: Player) =>
          player.id === "hero"
            ? {
              ...player,
              status: "folded" as const
            }
            : player
      )
    };

    expect(() =>
      applyAction(foldedState, {
        playerId: "hero",
        type: "fold",
        amount: 0,
        street: "preflop"
      })
    ).toThrow(
      "Player hero is not active"
    );
  });
});