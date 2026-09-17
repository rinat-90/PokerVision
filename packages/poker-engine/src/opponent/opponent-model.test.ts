import {
  describe,
  expect,
  it
} from "vitest";

import {
  buildOpponentModelRange,
  createOpponentModel
} from "./opponent-model.js";

import {
  createOpponentActionHistory
} from "./action-history.js";

import {
  createActionRangeWeightModel
} from "./action-range-weight.js";

import type {
  Player
} from "../game-state/types.js";

import type {
  Range
} from "../range/types.js";

describe(
  "createOpponentModel",
  () => {
    it(
      "creates an opponent model from a player",
      () => {
        const player: Player = {
          id: "villain-1",
          name: "Villain",
          position: "BB",
          stack: 1000,
          status: "active"
        };

        const range =
          {} as Range;

        const result =
          createOpponentModel({
            player,
            range,
            response: {
              foldProbability: 0.3
            }
          });

        expect(result.opponent)
          .toEqual({
            playerId: "villain-1",
            playerName: "Villain",
            position: "BB",
            stack: 1000,
            status: "active",
            range
          });

        expect(result.response)
          .toEqual({
            foldProbability: 0.3,
            callProbability: 0.7,
            raiseProbability: 0
          });
      }
    );

    it(
      "builds a narrowed and weighted opponent range",
      () => {
        const model =
          createOpponentModel({
            player: {
              id: "villain",
              name: "Villain",
              position: "BTN",
              stack: 1000,
              status: "active"
            },
            range: {
              combos: [
                {
                  cards: [
                    {
                      rank: "A",
                      suit: "spades"
                    },
                    {
                      rank: "A",
                      suit: "hearts"
                    }
                  ],
                  weight: 1
                },
                {
                  cards: [
                    {
                      rank: "K",
                      suit: "spades"
                    },
                    {
                      rank: "K",
                      suit: "hearts"
                    }
                  ],
                  weight: 1
                }
              ]
            },
            response: {
              foldProbability: 0,
              callProbability: 1,
              raiseProbability: 0
            }
          });

        const actionHistory =
          createOpponentActionHistory({
            playerId: "villain",
            actions: [
              {
                playerId: "villain",
                type: "raise",
                amount: 200,
                street: "flop"
              }
            ],
            currentActionIndex: 1
          });

        const weightModel =
          createActionRangeWeightModel({
            multipliers: {
              raise: 1.5
            }
          });

        const result =
          buildOpponentModelRange({
            model,
            actionHistory,
            board: [
              {
                rank: "A",
                suit: "spades"
              }
            ],
            street: "flop",
            weightModel
          });

        expect(
          result.opponent.range.combos
        ).toHaveLength(1);

        expect(
          result.opponent.range.combos[0]?.cards
        ).toEqual([
          {
            rank: "K",
            suit: "spades"
          },
          {
            rank: "K",
            suit: "hearts"
          }
        ]);

        expect(
          result.opponent.range.combos[0]?.weight
        ).toBe(1.5);

        expect(
          model.opponent.range.combos
        ).toHaveLength(2);
      }
    );
  }
);