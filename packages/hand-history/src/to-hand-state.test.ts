import {
  describe,
  expect,
  it
} from "vitest";

import type {
  HandHistory
} from "./types.js";

import {
  handHistoryToState
} from "./to-hand-state.js";

function createHandHistory(): HandHistory {
  return {
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
        startingStack: 200,
        holeCards: [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "spades"
          }
        ]
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
            amount: 6,
            amountType: "total",
            street: "preflop"
          }
        ]
      },
      {
        street: "flop",
        board: [
          {
            rank: "A",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          },
          {
            rank: "2",
            suit: "diamonds"
          }
        ],
        actions: [
          {
            playerId: "villain",
            type: "check",
            amount: 0,
            amountType: "contribution",
            street: "flop"
          },
          {
            playerId: "hero",
            type: "bet",
            amount: 8,
            amountType: "contribution",
            street: "flop"
          },
          {
            playerId: "villain",
            type: "call",
            amount: 8,
            amountType: "contribution",
            street: "flop"
          }
        ]
      }
    ]
  };
}

describe("handHistoryToState", () => {
  it("converts players", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(state.players).toHaveLength(2);

    expect(state.players[0]).toMatchObject({
      id: "hero",
      name: "Hero",
      position: "BTN",
      stack: 186,
      status: "active"
    });

    expect(state.players[1]).toMatchObject({
      id: "villain",
      name: "Villain",
      position: "BB",
      stack: 186,
      status: "active"
    });

    expect(
      state.players[0]?.holeCards
    ).toEqual([
      {
        rank: "A",
        suit: "spades"
      },
      {
        rank: "K",
        suit: "spades"
      }
    ]);
  });

  it("uses the latest street and board", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(state.street).toBe("flop");

    expect(state.board).toEqual([
      {
        rank: "A",
        suit: "hearts"
      },
      {
        rank: "7",
        suit: "clubs"
      },
      {
        rank: "2",
        suit: "diamonds"
      }
    ]);
  });

  it("flattens actions", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(state.actions).toHaveLength(5);

    expect(
      state.actions.map(
        (action) => action.type
      )
    ).toEqual([
      "raise",
      "call",
      "check",
      "bet",
      "call"
    ]);
  });

  it("calculates total contributions", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(
      state.totalContributions
    ).toEqual({
      hero: 14,
      villain: 14
    });
  });

  it("calculates current street contributions", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(
      state.playerContributions
    ).toEqual({
      hero: 8,
      villain: 8
    });
  });

  it("calculates the pot", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(state.pot).toBe(28);
  });

  it("finds the current bet", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(state.currentBet).toBe(8);
  });

  it("includes blinds in total contributions", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(
      state.totalContributions
    ).toEqual({
      hero: 14,
      villain: 14
    });

    expect(state.pot).toBe(28);
  });

  it("includes heads-up blinds before preflop actions", () => {
    const hand = createHandHistory();

    hand.streets = [
      {
        street: "preflop",
        board: [],
        actions: []
      }
    ];

    const state =
      handHistoryToState(hand);

    expect(
      state.totalContributions
    ).toEqual({
      hero: 1,
      villain: 2
    });

    expect(
      state.playerContributions
    ).toEqual({
      hero: 1,
      villain: 2
    });

    expect(state.pot).toBe(3);
  });

  it("finds the last aggressor", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(
      state.lastAggressorId
    ).toBe("hero");
  });

  it("calculates remaining player stacks", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(
      state.players[0]?.stack
    ).toBe(186);

    expect(
      state.players[1]?.stack
    ).toBe(186);
  });

  it("calculates remaining player stacks", () => {
    const state =
      handHistoryToState(
        createHandHistory()
      );

    expect(
      state.players[0]?.stack
    ).toBe(186);

    expect(
      state.players[1]?.stack
    ).toBe(186);
  });

  it("reconstructs the player to act", () => {
    const hand = createHandHistory();

    hand.streets = [
      {
        street: "flop",
        board: [
          {
            rank: "A",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          },
          {
            rank: "2",
            suit: "diamonds"
          }
        ],
        actions: [
          {
            playerId: "hero",
            type: "bet",
            amount: 8,
            amountType: "contribution",
            street: "flop"
          }
        ]
      }
    ];

    const state =
      handHistoryToState(hand);

    expect(
      state.currentPlayerId
    ).toBe("villain");

    expect(
      state.playersToAct
    ).toEqual(["villain"]);

    expect(
      state.bettingRoundComplete
    ).toBe(false);
  });

  it("detects a completed betting round", () => {
    const hand = createHandHistory();

    hand.streets = [
      {
        street: "flop",
        board: [
          {
            rank: "A",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          },
          {
            rank: "2",
            suit: "diamonds"
          }
        ],
        actions: [
          {
            playerId: "hero",
            type: "bet",
            amount: 8,
            amountType: "contribution",
            street: "flop"
          },
          {
            playerId: "villain",
            type: "call",
            amount: 8,
            amountType: "contribution",
            street: "flop"
          }
        ]
      }
    ];

    const state =
      handHistoryToState(hand);

    expect(
      state.currentPlayerId
    ).toBeNull();

    expect(
      state.playersToAct
    ).toEqual([]);

    expect(
      state.bettingRoundComplete
    ).toBe(true);
  });

  it("marks a folded player as folded", () => {
    const hand = createHandHistory();

    hand.streets = [
      {
        street: "preflop",
        board: [],
        actions: [
          {
            playerId: "hero",
            type: "fold",
            amount: 0,
            amountType: "contribution",
            street: "preflop"
          }
        ]
      }
    ];

    const state =
      handHistoryToState(hand);

    expect(
      state.players.find(
        (player) =>
          player.id === "hero"
      )?.status
    ).toBe("folded");

    expect(
      state.players.find(
        (player) =>
          player.id === "villain"
      )?.status
    ).toBe("active");
  });

  it("marks a player as all-in after an all-in action", () => {
    const hand = createHandHistory();

    hand.streets = [
      {
        street: "preflop",
        board: [],
        actions: [
          {
            playerId: "hero",
            type: "all_in",
            amount: 200,
            amountType: "contribution",
            street: "preflop"
          }
        ]
      }
    ];

    const state =
      handHistoryToState(hand);

    expect(
      state.players.find(
        (player) =>
          player.id === "hero"
      )?.status
    ).toBe("all_in");
  });

  it("normalizes total action amounts into contributions", () => {
    const hand = createHandHistory();

    hand.streets = [
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
            amount: 6,
            amountType: "total",
            street: "preflop"
          }
        ]
      }
    ];

    const state =
      handHistoryToState(hand);

    expect(state.actions).toEqual([
      {
        playerId: "hero",
        type: "raise",
        amount: 5,
        street: "preflop"
      },
      {
        playerId: "villain",
        type: "call",
        amount: 4,
        street: "preflop"
      }
    ]);

    expect(
      state.totalContributions
    ).toEqual({
      hero: 6,
      villain: 6
    });

    expect(state.pot).toBe(12);
  });

  it("normalizes multiple total actions from the same player", () => {
    const hand = createHandHistory();

    hand.streets = [
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
            amount: 6,
            amountType: "total",
            street: "preflop"
          }
        ]
      },
      {
        street: "flop",
        board: [
          {
            rank: "A",
            suit: "hearts"
          },
          {
            rank: "7",
            suit: "clubs"
          },
          {
            rank: "2",
            suit: "diamonds"
          }
        ],
        actions: [
          {
            playerId: "hero",
            type: "bet",
            amount: 10,
            amountType: "total",
            street: "flop"
          }
        ]
      }
    ];

    const state =
      handHistoryToState(hand);

    expect(state.actions).toEqual([
      {
        playerId: "hero",
        type: "raise",
        amount: 5,
        street: "preflop"
      },
      {
        playerId: "villain",
        type: "call",
        amount: 4,
        street: "preflop"
      },
      {
        playerId: "hero",
        type: "bet",
        amount: 4,
        street: "flop"
      }
    ]);

    expect(
      state.totalContributions
    ).toEqual({
      hero: 10,
      villain: 6
    });

    expect(
      state.playerContributions
    ).toEqual({
      hero: 4
    });
  });

});