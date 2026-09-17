import {
  describe,
  expect,
  it
} from "vitest";

import type {
  Range
} from "../range/types.js";

import {
  createOpponentActionHistory
} from "./action-history.js";

import {
  createActionRangeWeightModel
} from "./action-range-weight.js";

import {
  buildOpponentRange
} from "./build-opponent-range.js";

describe(
  "buildOpponentRange",
  () => {
    it(
      "removes impossible combos and preserves remaining weights",
      () => {
        const range: Range = {
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
              weight: 0.8
            }
          ]
        };

        const actionHistory =
          createOpponentActionHistory({
            playerId: "villain",
            actions: [],
            currentActionIndex: 0
          });

        const weightModel =
          createActionRangeWeightModel();

        const result =
          buildOpponentRange({
            range,
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
          result.originalComboCount
        ).toBe(2);

        expect(
          result.remainingComboCount
        ).toBe(1);

        expect(
          result.removedComboCount
        ).toBe(1);

        expect(
          result.range.combos
        ).toHaveLength(1);

        expect(
          result.range.combos[0]?.weight
        ).toBe(0.8);
      }
    );

    it(
      "applies action weights after narrowing",
      () => {
        const range: Range = {
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
        };

        const actions = [
          {
            playerId: "villain",
            type: "call" as const,
            amount: 100,
            street: "flop" as const
          }
        ];

        const actionHistory =
          createOpponentActionHistory({
            playerId: "villain",
            actions,
            currentActionIndex: 1
          });

        const weightModel =
          createActionRangeWeightModel({
            multipliers: {
              call: 0.5
            }
          });

        const result =
          buildOpponentRange({
            range,
            actionHistory,
            board: [],
            street: "flop",
            weightModel
          });

        expect(
          result.remainingComboCount
        ).toBe(2);

        expect(
          result.range.combos[0]?.weight
        ).toBe(0.5);

        expect(
          result.range.combos[1]?.weight
        ).toBe(0.5);

        expect(
          result.resultingWeight
        ).toBe(1);
      }
    );

    it(
      "applies action weights only to combos that survive narrowing",
      () => {
        const range: Range = {
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
        };

        const actions = [
          {
            playerId: "villain",
            type: "raise" as const,
            amount: 300,
            street: "turn" as const
          }
        ];

        const actionHistory =
          createOpponentActionHistory({
            playerId: "villain",
            actions,
            currentActionIndex: 1
          });

        const weightModel =
          createActionRangeWeightModel({
            multipliers: {
              raise: 1.5
            }
          });

        const result =
          buildOpponentRange({
            range,
            actionHistory,
            board: [
              {
                rank: "A",
                suit: "spades"
              }
            ],
            street: "turn",
            weightModel
          });

        expect(
          result.remainingComboCount
        ).toBe(1);

        expect(
          result.removedComboCount
        ).toBe(1);

        expect(
          result.range.combos[0]?.cards
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
          result.range.combos[0]?.weight
        ).toBe(1.5);

        expect(
          result.resultingWeight
        ).toBe(1.5);
      }
    );

    it(
      "preserves the original range",
      () => {
        const range: Range = {
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
            }
          ]
        };

        const actionHistory =
          createOpponentActionHistory({
            playerId: "villain",
            actions: [],
            currentActionIndex: 0
          });

        const weightModel =
          createActionRangeWeightModel({
            multipliers: {
              call: 0.5
            }
          });

        const result =
          buildOpponentRange({
            range,
            actionHistory,
            board: [],
            street: "flop",
            weightModel
          });

        expect(
          range.combos[0]?.weight
        ).toBe(1);

        expect(
          result.range
        ).not.toBe(range);
      }
    );
  }
);