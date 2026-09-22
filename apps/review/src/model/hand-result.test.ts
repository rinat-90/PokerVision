import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  HandReview,
} from "@poker-vision/hand-review";

import {
  createHandResult,
} from "./hand-result";

function createReview(): HandReview {
  return {
    id: "100061",

    gameFormat: "cash",

    blinds: {
      smallBlind: 50,
      bigBlind: 100,
      ante: 0,
    },

    players: [
      {
        id: "Pluribus",
        name: "Pluribus",
        position: "MP",
        startingStack: 10000,
      },
      {
        id: "MrBlue",
        name: "MrBlue",
        position: "BTN",
        startingStack: 10000,
      },
    ],

    streets: [
      {
        street: "river",

        board: [
          {
            rank: "Q",
            suit: "hearts",
          },
          {
            rank: "K",
            suit: "clubs",
          },
          {
            rank: "5",
            suit: "hearts",
          },
          {
            rank: "K",
            suit: "spades",
          },
          {
            rank: "6",
            suit: "spades",
          },
        ],

        actions: [
          {
            actionIndex: 16,
            playerId: "Pluribus",
            street: "river",
            type: "call",
            amount: 6825,

            state: {
              street: "river",

              board: [
                {
                  rank: "Q",
                  suit: "hearts",
                },
                {
                  rank: "K",
                  suit: "clubs",
                },
                {
                  rank: "5",
                  suit: "hearts",
                },
                {
                  rank: "K",
                  suit: "spades",
                },
                {
                  rank: "6",
                  suit: "spades",
                },
              ],

              players: [],

              pot: 14525,
              currentBet: 6825,
              minimumRaise: 6825,

              playerContributions: {
                MrBlue: 6825,
                Pluribus: 0,
              },

              totalContributions: {
                MrBlue: 10000,
                Pluribus: 3175,
              },
            },
          },
        ],
      },
    ],

    decisions: [],

    summary: {
      totalDecisionPoints: 5,
      analyzedDecisionPoints: 5,
      skippedDecisionPoints: 0,
      callDecisions: 3,
    },

    showdown: {
      players: [
        {
          playerId: "MrBlue",

          cards: [
            {
              rank: "5",
              suit: "diamonds",
            },
            {
              rank: "5",
              suit: "clubs",
            },
          ],
        },
        {
          playerId: "Pluribus",

          cards: [
            {
              rank: "A",
              suit: "spades",
            },
            {
              rank: "A",
              suit: "hearts",
            },
          ],
        },
      ],

      payouts: [
        {
          playerId: "MrBlue",
          amount: 21350,
        },
      ],
    },
  };
}

describe("createHandResult", () => {
  it("creates the final showdown result", () => {
    const result =
      createHandResult(
        createReview(),
      );

    expect(result?.finalPot).toBe(
      21350,
    );

    expect(result?.board).toEqual([
      {
        rank: "Q",
        suit: "hearts",
      },
      {
        rank: "K",
        suit: "clubs",
      },
      {
        rank: "5",
        suit: "hearts",
      },
      {
        rank: "K",
        suit: "spades",
      },
      {
        rank: "6",
        suit: "spades",
      },
    ]);

    expect(result?.players).toEqual([
      {
        playerId: "MrBlue",
        name: "MrBlue",

        cards: [
          {
            rank: "5",
            suit: "diamonds",
          },
          {
            rank: "5",
            suit: "clubs",
          },
        ],

        payout: 21350,
        isWinner: true,
      },
      {
        playerId: "Pluribus",
        name: "Pluribus",

        cards: [
          {
            rank: "A",
            suit: "spades",
          },
          {
            rank: "A",
            suit: "hearts",
          },
        ],

        payout: 0,
        isWinner: false,
      },
    ]);

    expect(result?.winners).toEqual([
      expect.objectContaining({
        playerId: "MrBlue",
        payout: 21350,
        isWinner: true,
      }),
    ]);
  });

  it("returns undefined without showdown", () => {
    const review =
      createReview();

    delete review.showdown;

    expect(
      createHandResult(review),
    ).toBeUndefined();
  });
});