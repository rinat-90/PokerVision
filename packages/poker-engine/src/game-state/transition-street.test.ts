import {
  describe,
  expect,
  it
} from "vitest";

import {
  applyAction,
  createHand,
  startHand,
  transitionStreet,
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
    id: "street-test",
    gameFormat: "cash",
    smallBlind: 1,
    bigBlind: 2,
    players
  });

  return startHand(hand);
}

function completePreflop(
  state: ReturnType<typeof createTestHand>
) {
  let currentState = state;

  currentState =
    applyAction(
      currentState,
      {
        playerId: "hero",
        type: "call",
        amount: 2,
        street: "preflop"
      }
    );

  currentState =
    applyAction(
      currentState,
      {
        playerId: "villain",
        type: "call",
        amount: 2,
        street: "preflop"
      }
    );

  currentState =
    applyAction(
      currentState,
      {
        playerId: "sb",
        type: "call",
        amount: 1,
        street: "preflop"
      }
    );

  currentState =
    applyAction(
      currentState,
      {
        playerId: "bb",
        type: "check",
        amount: 0,
        street: "preflop"
      }
    );

  return currentState;
}

describe("transitionStreet", () => {
  it("transitions from preflop to flop", () => {
    const state =
      completePreflop(
        createTestHand()
      );

    expect(
      state.bettingRoundComplete
    ).toBe(true);

    const flop =
      transitionStreet(
        state,
        [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          }
        ]
      );

    expect(
      flop.street
    ).toBe("flop");

    expect(
      flop.board
    ).toEqual([
      {
        rank: "A",
        suit: "spades"
      },
      {
        rank: "K",
        suit: "hearts"
      },
      {
        rank: "7",
        suit: "clubs"
      }
    ]);
  });

  it("starts the flop with the first active player after BTN", () => {
    const state =
      completePreflop(
        createTestHand()
      );

    const flop =
      transitionStreet(
        state,
        [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          }
        ]
      );

    expect(
      flop.currentPlayerId
    ).toBe("sb");

    expect(
      flop.playersToAct
    ).toEqual([
      "sb",
      "bb",
      "hero",
      "villain"
    ]);
  });

  it("resets betting state on the flop", () => {
    const state =
      completePreflop(
        createTestHand()
      );

    const flop =
      transitionStreet(
        state,
        [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          }
        ]
      );

    expect(
      flop.currentBet
    ).toBe(0);

    expect(
      flop.minimumRaise
    ).toBe(2);

    expect(
      flop.lastAggressorId
    ).toBeNull();

    expect(
      flop.playerContributions
    ).toEqual({
      hero: 0,
      villain: 0,
      sb: 0,
      bb: 0
    });

    expect(
      flop.bettingRoundComplete
    ).toBe(false);
  });

  it("requires exactly three cards for the flop", () => {
    const state =
      completePreflop(
        createTestHand()
      );

    expect(() =>
      transitionStreet(
        state,
        [
          {
            rank: "A",
            suit: "spades"
          }
        ]
      )
    ).toThrow(
      "flop requires exactly 3 board cards"
    );
  });

  it("does not allow a street transition before betting is complete", () => {
    const state =
      createTestHand();

    expect(
      state.bettingRoundComplete
    ).toBe(false);

    expect(() =>
      transitionStreet(
        state,
        [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          }
        ]
      )
    ).toThrow(
      "Cannot transition street before betting round is complete"
    );
  });

  it("transitions from flop to turn", () => {
    const preflop =
      completePreflop(
        createTestHand()
      );

    const flop =
      transitionStreet(
        preflop,
        [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          }
        ]
      );

    const turnReady = {
      ...flop,
      bettingRoundComplete: true
    };

    const turn =
      transitionStreet(
        turnReady,
        [
          {
            rank: "2",
            suit: "diamonds"
          }
        ]
      );

    expect(
      turn.street
    ).toBe("turn");

    expect(
      turn.board
    ).toHaveLength(4);

    expect(
      turn.board[3]
    ).toEqual({
      rank: "2",
      suit: "diamonds"
    });

    expect(
      turn.currentPlayerId
    ).toBe("sb");
  });

  it("transitions from turn to river", () => {
    const state =
      completePreflop(
        createTestHand()
      );

    const flop =
      transitionStreet(
        state,
        [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          }
        ]
      );

    const turn =
      transitionStreet(
        {
          ...flop,
          bettingRoundComplete: true
        },
        [
          {
            rank: "2",
            suit: "diamonds"
          }
        ]
      );

    const river =
      transitionStreet(
        {
          ...turn,
          bettingRoundComplete: true
        },
        [
          {
            rank: "Q",
            suit: "clubs"
          }
        ]
      );

    expect(
      river.street
    ).toBe("river");

    expect(
      river.board
    ).toHaveLength(5);

    expect(
      river.currentPlayerId
    ).toBe("sb");
  });

  it("transitions from river to showdown", () => {
    const state =
      completePreflop(
        createTestHand()
      );

    const riverState = {
      ...state,
      street: "river" as const,
      board: [
        {
          rank: "A" as const,
          suit: "spades" as const
        },
        {
          rank: "K" as const,
          suit: "hearts" as const
        },
        {
          rank: "7" as const,
          suit: "clubs" as const
        },
        {
          rank: "2" as const,
          suit: "diamonds" as const
        },
        {
          rank: "Q" as const,
          suit: "clubs" as const
        }
      ],
      bettingRoundComplete: true
    };

    const showdown =
      transitionStreet(
        riverState,
        []
      );

    expect(
      showdown.street
    ).toBe("showdown");

    expect(
      showdown.board
    ).toHaveLength(5);

    expect(
      showdown.currentPlayerId
    ).toBeNull();

    expect(
      showdown.playersToAct
    ).toEqual([]);

    expect(
      showdown.bettingRoundComplete
    ).toBe(true);
  });

  it("handles heads-up postflop order correctly", () => {
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

    const hand =
      createHand({
        id: "heads-up-street-test",
        gameFormat: "cash",
        smallBlind: 1,
        bigBlind: 2,
        players
      });

    const started =
      startHand(hand);

    const completed =
      applyAction(
        started,
        {
          playerId: "hero",
          type: "check",
          amount: 0,
          street: "preflop"
        }
      );

    const flop =
      transitionStreet(
        {
          ...completed,
          bettingRoundComplete: true
        },
        [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          }
        ]
      );

    expect(
      flop.currentPlayerId
    ).toBe("villain");

    expect(
      flop.playersToAct
    ).toEqual([
      "villain",
      "hero"
    ]);
  });

  it("resets street contributions while preserving total contributions", () => {
    const players: Player[] = [
      {
        id: "hero",
        name: "Hero",
        position: "BTN",
        stack: 100,
        status: "active"
      },
      {
        id: "villain",
        name: "Villain",
        position: "BB",
        stack: 100,
        status: "active"
      }
    ];

    const hand =
      createHand({
        id: "contributions-test",
        gameFormat: "cash",
        smallBlind: 1,
        bigBlind: 2,
        players
      });

    const started =
      startHand(hand);

    /*
     * Heads-up preflop starts with BB.
     * BB checks.
     */
    const bbChecked =
      applyAction(
        started,
        {
          playerId: "villain",
          type: "check",
          amount: 0,
          street: "preflop"
        }
      );

    /*
     * BTN/SB calls the remaining 1.
     */
    const completed =
      applyAction(
        bbChecked,
        {
          playerId: "hero",
          type: "call",
          amount: 1,
          street: "preflop"
        }
      );

    expect(
      completed.playerContributions
    ).toEqual({
      hero: 2,
      villain: 2
    });

    expect(
      completed.totalContributions
    ).toEqual({
      hero: 2,
      villain: 2
    });

    const flop =
      transitionStreet(
        {
          ...completed,
          bettingRoundComplete: true
        },
        [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          }
        ]
      );

    expect(
      flop.playerContributions
    ).toEqual({
      hero: 0,
      villain: 0
    });

    expect(
      flop.totalContributions
    ).toEqual({
      hero: 2,
      villain: 2
    });
  });
});