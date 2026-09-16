import { describe, expect, it } from "vitest";

import type {
  HandHistory
} from "./types.js";

import {
  validateHandHistory
} from "./validate-hand-history.js";

function createValidHand(): HandHistory {
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
        actions: []
      },
      {
        street: "flop",
        board: [
          { rank: "A", suit: "spades" },
          { rank: "K", suit: "hearts" },
          { rank: "7", suit: "clubs" }
        ],
        actions: []
      },
      {
        street: "turn",
        board: [
          { rank: "A", suit: "spades" },
          { rank: "K", suit: "hearts" },
          { rank: "7", suit: "clubs" },
          { rank: "2", suit: "diamonds" }
        ],
        actions: []
      },
      {
        street: "river",
        board: [
          { rank: "A", suit: "spades" },
          { rank: "K", suit: "hearts" },
          { rank: "7", suit: "clubs" },
          { rank: "2", suit: "diamonds" },
          { rank: "3", suit: "hearts" }
        ],
        actions: []
      }
    ]
  };
}

describe("validateHandHistory", () => {
  it("accepts a valid hand history", () => {
    const hand = createValidHand();

    expect(() =>
      validateHandHistory(hand)
    ).not.toThrow();
  });

  it("requires at least two players", () => {
    const hand = createValidHand();

    hand.players = [
      hand.players[0]!
    ];

    expect(() =>
      validateHandHistory(hand)
    ).toThrow(
      "A hand history requires at least two players"
    );
  });

  it("rejects invalid board size", () => {
    const hand = createValidHand();

    hand.streets[1]!.board = [];

    expect(() =>
      validateHandHistory(hand)
    ).toThrow(
      "flop must contain 3 board cards"
    );
  });

  it("rejects streets out of order", () => {
    const hand = createValidHand();

    hand.streets = [
      hand.streets[0]!,
      hand.streets[2]!,
      hand.streets[1]!
    ];

    expect(() =>
      validateHandHistory(hand)
    ).toThrow(
      "Streets must be in chronological order"
    );
  });

  it("rejects duplicate player ids", () => {
    const hand = createValidHand();

    hand.players[1]!.id =
      hand.players[0]!.id;

    expect(() =>
      validateHandHistory(hand)
    ).toThrow(
      "Duplicate player id: hero"
    );
  });

  it("rejects duplicate cards", () => {
    const hand = createValidHand();

    hand.players[0]!.holeCards = [
      {
        rank: "A",
        suit: "spades"
      },
      {
        rank: "K",
        suit: "spades"
      }
    ];

    hand.players[1]!.holeCards = [
      {
        rank: "A",
        suit: "spades"
      },
      {
        rank: "Q",
        suit: "spades"
      }
    ];

    expect(() =>
      validateHandHistory(hand)
    ).toThrow(
      "Duplicate card detected: A:spades"
    );
  });

  it("rejects actions for unknown players", () => {
    const hand = createValidHand();

    hand.streets[0]!.actions = [
      {
        playerId: "unknown",
        type: "call",
        amount: 2,
        amountType: "contribution",
        street: "preflop"
      }
    ];

    expect(() =>
      validateHandHistory(hand)
    ).toThrow(
      "Action references unknown player: unknown"
    );
  });

  it("rejects a big blind smaller than the small blind", () => {
    const hand = createValidHand();

    hand.smallBlind = 5;
    hand.bigBlind = 2;

    expect(() =>
      validateHandHistory(hand)
    ).toThrow(
      "Big blind cannot be smaller than small blind"
    );
  });
});