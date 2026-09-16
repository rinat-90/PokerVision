import { describe, expect, it } from "vitest";

import type {
  Player
} from "../types.js";

import type {
  Card
} from "../../types.js";

import {
  settleShowdown
} from "./settlement.js";

describe("settleShowdown", () => {
  it("awards the pot to the player with the best hand", () => {
    const players: Player[] = [
      {
        id: "hero",
        name: "Hero",
        position: "BTN",
        stack: 0,
        status: "active",
        holeCards: [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "A",
            suit: "hearts"
          }
        ]
      },
      {
        id: "villain",
        name: "Villain",
        position: "BB",
        stack: 0,
        status: "active",
        holeCards: [
          {
            rank: "K",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          }
        ]
      }
    ];


    const board: Card[] = [
      {
        rank: "A",
        suit: "clubs"
      },
      {
        rank: "K",
        suit: "clubs"
      },
      {
        rank: "7",
        suit: "diamonds"
      },
      {
        rank: "2",
        suit: "hearts"
      },
      {
        rank: "3",
        suit: "clubs"
      }
    ];

    const result =
      settleShowdown(
        players,
        board,
        {
          hero: 100,
          villain: 100
        }
      );

    expect(result.pots).toHaveLength(1);

    expect(
      result.pots[0]
    ).toEqual({
      amount: 200,
      eligiblePlayerIds: [
        "hero",
        "villain"
      ],
      winnerIds: [
        "hero"
      ]
    });

    expect(
      result.payouts
    ).toEqual({
      hero: 200,
      villain: 0
    });
  });
  it("awards the main pot and side pot only to eligible players", () => {
    const players: Player[] = [
      {
        id: "hero",
        name: "Hero",
        position: "BTN",
        stack: 0,
        status: "active",
        holeCards: [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "A",
            suit: "hearts"
          }
        ]
      },
      {
        id: "villain",
        name: "Villain",
        position: "BB",
        stack: 0,
        status: "active",
        holeCards: [
          {
            rank: "K",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          }
        ]
      },
      {
        id: "fish",
        name: "Fish",
        position: "CO",
        stack: 0,
        status: "all_in",
        holeCards: [
          {
            rank: "2",
            suit: "spades"
          },
          {
            rank: "2",
            suit: "hearts"
          }
        ]
      }
    ];

    const board: Card[] = [
      {
        rank: "A",
        suit: "clubs"
      },
      {
        rank: "K",
        suit: "clubs"
      },
      {
        rank: "7",
        suit: "diamonds"
      },
      {
        rank: "2",
        suit: "clubs"
      },
      {
        rank: "3",
        suit: "hearts"
      }
    ];

    const result =
      settleShowdown(
        players,
        board,
        {
          hero: 100,
          villain: 100,
          fish: 300
        }
      );

    expect(result.pots).toEqual([
      {
        amount: 300,
        eligiblePlayerIds: [
          "hero",
          "villain",
          "fish"
        ],
        winnerIds: [
          "hero"
        ]
      },
      {
        amount: 200,
        eligiblePlayerIds: [
          "fish"
        ],
        winnerIds: [
          "fish"
        ]
      }
    ]);

    expect(
      result.payouts
    ).toEqual({
      hero: 300,
      villain: 0,
      fish: 200
    });
  });
  it("keeps a folded player's contribution in the pot but excludes them from winning", () => {
    const players: Player[] = [
      {
        id: "hero",
        name: "Hero",
        position: "BTN",
        stack: 0,
        status: "active",
        holeCards: [
          {
            rank: "A",
            suit: "spades"
          },
          {
            rank: "A",
            suit: "hearts"
          }
        ]
      },
      {
        id: "villain",
        name: "Villain",
        position: "BB",
        stack: 0,
        status: "folded",
        holeCards: [
          {
            rank: "K",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          }
        ]
      },
      {
        id: "fish",
        name: "Fish",
        position: "CO",
        stack: 0,
        status: "all_in",
        holeCards: [
          {
            rank: "2",
            suit: "spades"
          },
          {
            rank: "2",
            suit: "hearts"
          }
        ]
      }
    ];

    const board: Card[] = [
      {
        rank: "A",
        suit: "clubs"
      },
      {
        rank: "K",
        suit: "clubs"
      },
      {
        rank: "7",
        suit: "diamonds"
      },
      {
        rank: "2",
        suit: "clubs"
      },
      {
        rank: "3",
        suit: "hearts"
      }
    ];

    const result =
      settleShowdown(
        players,
        board,
        {
          hero: 100,
          villain: 100,
          fish: 300
        }
      );

    expect(result.pots).toEqual([
      {
        amount: 300,
        eligiblePlayerIds: [
          "hero",
          "fish"
        ],
        winnerIds: [
          "hero"
        ]
      },
      {
        amount: 200,
        eligiblePlayerIds: [
          "fish"
        ],
        winnerIds: [
          "fish"
        ]
      }
    ]);

    expect(
      result.payouts
    ).toEqual({
      hero: 300,
      villain: 0,
      fish: 200
    });
  });
  it("splits the pot when players have identical best hands", () => {
    const players: Player[] = [
      {
        id: "hero",
        name: "Hero",
        position: "BTN",
        stack: 0,
        status: "active",
        holeCards: [
          {
            rank: "2",
            suit: "spades"
          },
          {
            rank: "3",
            suit: "spades"
          }
        ]
      },
      {
        id: "villain",
        name: "Villain",
        position: "BB",
        stack: 0,
        status: "active",
        holeCards: [
          {
            rank: "4",
            suit: "hearts"
          },
          {
            rank: "5",
            suit: "hearts"
          }
        ]
      }
    ];

    const board: Card[] = [
      {
        rank: "A",
        suit: "spades"
      },
      {
        rank: "K",
        suit: "clubs"
      },
      {
        rank: "Q",
        suit: "diamonds"
      },
      {
        rank: "J",
        suit: "hearts"
      },
      {
        rank: "T",
        suit: "clubs"
      }
    ];

    const result =
      settleShowdown(
        players,
        board,
        {
          hero: 100,
          villain: 100
        }
      );

    expect(result.pots).toEqual([
      {
        amount: 200,
        eligiblePlayerIds: [
          "hero",
          "villain"
        ],
        winnerIds: [
          "hero",
          "villain"
        ]
      }
    ]);

    expect(
      result.payouts
    ).toEqual({
      hero: 100,
      villain: 100
    });
  });
  it("settles multiple side pots with different eligible players", () => {
    const players: Player[] = [
      {
        id: "short",
        name: "Short",
        position: "BTN",
        stack: 0,
        status: "all_in",
        holeCards: [
          { rank: "A", suit: "spades" },
          { rank: "A", suit: "hearts" }
        ]
      },
      {
        id: "medium",
        name: "Medium",
        position: "SB",
        stack: 0,
        status: "all_in",
        holeCards: [
          { rank: "K", suit: "spades" },
          { rank: "K", suit: "hearts" }
        ]
      },
      {
        id: "deep",
        name: "Deep",
        position: "BB",
        stack: 0,
        status: "active",
        holeCards: [
          { rank: "Q", suit: "spades" },
          { rank: "Q", suit: "hearts" }
        ]
      }
    ];

    const board: Card[] = [
      { rank: "2", suit: "clubs" },
      { rank: "7", suit: "diamonds" },
      { rank: "9", suit: "hearts" },
      { rank: "J", suit: "clubs" },
      { rank: "3", suit: "diamonds" }
    ];

    const result = settleShowdown(
      players,
      board,
      {
        short: 50,
        medium: 100,
        deep: 200
      }
    );

    expect(result.pots).toHaveLength(3);

    expect(result.pots[0]).toEqual({
      amount: 150,
      eligiblePlayerIds: [
        "short",
        "medium",
        "deep"
      ],
      winnerIds: ["short"]
    });

    expect(result.pots[1]).toEqual({
      amount: 100,
      eligiblePlayerIds: [
        "medium",
        "deep"
      ],
      winnerIds: ["medium"]
    });

    expect(result.pots[2]).toEqual({
      amount: 100,
      eligiblePlayerIds: [
        "deep"
      ],
      winnerIds: ["deep"]
    });

    expect(result.payouts).toEqual({
      short: 150,
      medium: 100,
      deep: 100
    });
  });
  it("includes folded player's contribution as dead money", () => {
    const players: Player[] = [
      {
        id: "hero",
        name: "Hero",
        position: "BTN",
        stack: 0,
        status: "active",
        holeCards: [
          { rank: "A", suit: "spades" },
          { rank: "A", suit: "hearts" }
        ]
      },
      {
        id: "villain",
        name: "Villain",
        position: "SB",
        stack: 0,
        status: "folded",
        holeCards: [
          { rank: "K", suit: "spades" },
          { rank: "K", suit: "hearts" }
        ]
      },
      {
        id: "deep",
        name: "Deep",
        position: "BB",
        stack: 0,
        status: "active",
        holeCards: [
          { rank: "Q", suit: "spades" },
          { rank: "Q", suit: "hearts" }
        ]
      }
    ];

    const board: Card[] = [
      { rank: "2", suit: "clubs" },
      { rank: "7", suit: "diamonds" },
      { rank: "9", suit: "hearts" },
      { rank: "J", suit: "clubs" },
      { rank: "3", suit: "diamonds" }
    ];

    const result = settleShowdown(
      players,
      board,
      {
        hero: 100,
        villain: 100,
        deep: 200
      }
    );

    expect(result.pots).toHaveLength(2);

    expect(result.pots[0]).toEqual({
      amount: 300,
      eligiblePlayerIds: [
        "hero",
        "deep"
      ],
      winnerIds: ["hero"]
    });

    expect(result.pots[1]).toEqual({
      amount: 100,
      eligiblePlayerIds: ["deep"],
      winnerIds: ["deep"]
    });

    expect(result.payouts).toEqual({
      hero: 300,
      villain: 0,
      deep: 100
    });
  });
  it("splits one pot while another side pot has a different winner", () => {
    const players: Player[] = [
      {
        id: "hero",
        name: "Hero",
        position: "BTN",
        stack: 0,
        status: "all_in",
        holeCards: [
          { rank: "A", suit: "spades" },
          { rank: "K", suit: "spades" }
        ]
      },
      {
        id: "villain",
        name: "Villain",
        position: "SB",
        stack: 0,
        status: "all_in",
        holeCards: [
          { rank: "A", suit: "hearts" },
          { rank: "K", suit: "hearts" }
        ]
      },
      {
        id: "deep",
        name: "Deep",
        position: "BB",
        stack: 0,
        status: "active",
        holeCards: [
          { rank: "Q", suit: "clubs" },
          { rank: "Q", suit: "diamonds" }
        ]
      }
    ];

    const board: Card[] = [
      { rank: "A", suit: "clubs" },
      { rank: "K", suit: "clubs" },
      { rank: "7", suit: "diamonds" },
      { rank: "2", suit: "hearts" },
      { rank: "3", suit: "clubs" }
    ];

    const result = settleShowdown(
      players,
      board,
      {
        hero: 100,
        villain: 100,
        deep: 200
      }
    );

    expect(result.pots).toHaveLength(2);

    expect(result.pots[0]).toEqual({
      amount: 300,
      eligiblePlayerIds: [
        "hero",
        "villain",
        "deep"
      ],
      winnerIds: [
        "hero",
        "villain"
      ]
    });

    expect(result.pots[1]).toEqual({
      amount: 100,
      eligiblePlayerIds: [
        "deep"
      ],
      winnerIds: ["deep"]
    });

    expect(result.payouts).toEqual({
      hero: 150,
      villain: 150,
      deep: 100
    });
  });
  it("preserves the total number of chips during settlement", () => {
    const players: Player[] = [
      {
        id: "short",
        name: "Short",
        position: "BTN",
        stack: 0,
        status: "all_in",
        holeCards: [
          { rank: "A", suit: "spades" },
          { rank: "A", suit: "hearts" }
        ]
      },
      {
        id: "medium",
        name: "Medium",
        position: "SB",
        stack: 0,
        status: "all_in",
        holeCards: [
          { rank: "K", suit: "spades" },
          { rank: "K", suit: "hearts" }
        ]
      },
      {
        id: "deep",
        name: "Deep",
        position: "BB",
        stack: 0,
        status: "active",
        holeCards: [
          { rank: "Q", suit: "spades" },
          { rank: "Q", suit: "hearts" }
        ]
      }
    ];

    const board: Card[] = [
      { rank: "2", suit: "clubs" },
      { rank: "7", suit: "diamonds" },
      { rank: "9", suit: "hearts" },
      { rank: "J", suit: "clubs" },
      { rank: "3", suit: "diamonds" }
    ];

    const contributions = {
      short: 50,
      medium: 100,
      deep: 200
    };

    const result = settleShowdown(
      players,
      board,
      contributions
    );

    const totalPot = result.pots.reduce(
      (sum, pot) => sum + pot.amount,
      0
    );

    const totalPayouts = Object.values(
      result.payouts
    ).reduce(
      (sum, payout) => sum + payout,
      0
    );

    expect(totalPayouts).toBe(totalPot);

    expect(totalPot).toBe(
      Object.values(contributions).reduce(
        (sum, contribution) =>
          sum + contribution,
        0
      )
    );
  });
});