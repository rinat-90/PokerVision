import {
  describe,
  expect,
  it
} from "vitest";

import type {
  Range
} from "../range/types.js";

import {
  createActionRangeWeightModel
} from "./action-range-weight.js";

import {
  createOpponentActionHistory
} from "./action-history.js";

import {
  applyActionRangeWeights
} from "./apply-action-range-weights.js";

describe(
  "applyActionRangeWeights",
  () => {
    it(
      "preserves weights when there is no action history",
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
              weight: 0.5
            }
          ]
        };

        const actionHistory =
          createOpponentActionHistory({
            playerId: "villain",
            actions: [],
            currentActionIndex: 0
          });

        const model =
          createActionRangeWeightModel();

        const result =
          applyActionRangeWeights({
            range,
            actionHistory,
            model
          });

        expect(
          result.originalWeight
        ).toBe(1.5);

        expect(
          result.resultingWeight
        ).toBe(1.5);

        expect(
          result.range.combos[0]?.weight
        ).toBe(1);

        expect(
          result.range.combos[1]?.weight
        ).toBe(0.5);
      }
    );

    it(
      "applies a single action multiplier",
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
                  rank: "K",
                  suit: "spades"
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

        const model =
          createActionRangeWeightModel({
            multipliers: {
              call: 0.8
            }
          });

        const result =
          applyActionRangeWeights({
            range,
            actionHistory,
            model
          });

        expect(
          result.range.combos[0]?.weight
        ).toBe(0.8);

        expect(
          result.resultingWeight
        ).toBe(0.8);
      }
    );

    it(
      "combines multiple action multipliers",
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
                  rank: "K",
                  suit: "spades"
                }
              ],
              weight: 1
            },
            {
              cards: [
                {
                  rank: "Q",
                  suit: "spades"
                },
                {
                  rank: "Q",
                  suit: "hearts"
                }
              ],
              weight: 0.5
            }
          ]
        };

        const actions = [
          {
            playerId: "villain",
            type: "call" as const,
            amount: 100,
            street: "flop" as const
          },
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
            currentActionIndex: 2
          });

        const model =
          createActionRangeWeightModel({
            multipliers: {
              call: 0.8,
              raise: 1.5
            }
          });

        const result =
          applyActionRangeWeights({
            range,
            actionHistory,
            model
          });

        expect(
          result.range.combos[0]?.weight
        ).toBeCloseTo(1.2);

        expect(
          result.range.combos[1]?.weight
        ).toBeCloseTo(0.6);

        expect(
          result.resultingWeight
        ).toBeCloseTo(1.8);
      }
    );

    it(
      "does not mutate the original range",
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
                  rank: "K",
                  suit: "spades"
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

        const model =
          createActionRangeWeightModel({
            multipliers: {
              call: 0.5
            }
          });

        const result =
          applyActionRangeWeights({
            range,
            actionHistory,
            model
          });

        expect(
          range.combos[0]?.weight
        ).toBe(1);

        expect(
          result.range.combos[0]?.weight
        ).toBe(0.5);

        expect(
          result.range
        ).not.toBe(range);

        expect(
          result.range.combos
        ).not.toBe(range.combos);
      }
    );

    it(
      "fold removes the range weight",
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
                  rank: "K",
                  suit: "spades"
                }
              ],
              weight: 1
            }
          ]
        };

        const actions = [
          {
            playerId: "villain",
            type: "fold" as const,
            amount: 0,
            street: "river" as const
          }
        ];

        const actionHistory =
          createOpponentActionHistory({
            playerId: "villain",
            actions,
            currentActionIndex: 1
          });

        const model =
          createActionRangeWeightModel();

        const result =
          applyActionRangeWeights({
            range,
            actionHistory,
            model
          });

        expect(
          result.range.combos[0]?.weight
        ).toBe(0);

        expect(
          result.resultingWeight
        ).toBe(0);
      }
    );
  }
);