import {
  describe,
  expect,
  it
} from "vitest";

import type {
  HandReview
} from "@poker-vision/hand-review";

import {
  getShowdownTableState
} from "./showdown-table-state";

describe("getShowdownTableState", () => {
  it("builds the final table state after the last action", () => {
    const review = {
      showdown: {
        players: [
          {
            playerId: "MrBlue",
            cards: [
              {
                rank: "5",
                suit: "diamonds"
              },
              {
                rank: "5",
                suit: "clubs"
              }
            ]
          },
          {
            playerId: "Pluribus",
            cards: [
              {
                rank: "A",
                suit: "spades"
              },
              {
                rank: "A",
                suit: "hearts"
              }
            ]
          }
        ],

        payouts: [
          {
            playerId: "MrBlue",
            amount: 21350
          }
        ]
      },

      streets: [
        {
          street: "river",
          board: [],
          actions: [
            {
              actionIndex: 16,
              playerId: "Pluribus",
              street: "river",
              type: "call",
              amount: 6825,

              state: {
                street: "river",
                board: [],
                pot: 14525,
                currentBet: 6825,
                minimumRaise: 6825,

                playerContributions: {
                  MrBlue: 6825,
                  Pluribus: 0
                },

                totalContributions: {
                  MrBlue: 10000,
                  Pluribus: 3175
                },

                players: [
                  {
                    id: "MrBlue",
                    name: "MrBlue",
                    position: "BTN",
                    stack: 0,
                    status: "all_in"
                  },
                  {
                    id: "Pluribus",
                    name: "Pluribus",
                    position: "MP",
                    stack: 6825,
                    status: "active"
                  }
                ]
              }
            }
          ]
        }
      ]
    } as unknown as HandReview;

    const state =
      getShowdownTableState(review);

    expect(state?.pot).toBe(21350);

    expect(
      state?.players.find(
        player =>
          player.id === "MrBlue"
      )
    ).toMatchObject({
      stack: 0,
      status: "all_in"
    });

    expect(
      state?.players.find(
        player =>
          player.id === "Pluribus"
      )
    ).toMatchObject({
      stack: 0,
      status: "all_in"
    });

    expect(
      state?.playerContributions
    ).toEqual({
      MrBlue: 6825,
      Pluribus: 6825
    });

    expect(
      state?.totalContributions
    ).toEqual({
      MrBlue: 10000,
      Pluribus: 10000
    });
  });

  it("returns undefined without showdown data", () => {
    const review = {
      showdown: undefined,
      streets: []
    } as unknown as HandReview;

    expect(
      getShowdownTableState(review)
    ).toBeUndefined();
  });
});