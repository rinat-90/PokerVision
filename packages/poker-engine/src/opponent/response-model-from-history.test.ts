import {
  describe,
  expect,
  it
} from "vitest";

import {
  createOpponentResponseModelFromHistory
} from "./response-model-from-history.js";

import type {
  OpponentActionHistory
} from "./action-history.js";

function createHistory(
  type: OpponentActionHistory["actions"][number]["type"]
): OpponentActionHistory {
  return {
    playerId: "villain",
    actions: [
      {
        actionIndex: 0,
        playerId: "villain",
        type,
        amount: 100,
        street: "flop"
      }
    ]
  };
}

describe(
  "createOpponentResponseModelFromHistory",
  () => {
    it(
      "creates a default model when there is no history",
      () => {
        const result =
          createOpponentResponseModelFromHistory({
            actionHistory: {
              playerId: "villain",
              actions: []
            }
          });

        expect(result)
          .toEqual({
            foldProbability: 0.33,
            callProbability: 0.67,
            raiseProbability: 0
          });
      }
    );

    it(
      "creates a check-based response model",
      () => {
        const result =
          createOpponentResponseModelFromHistory({
            actionHistory:
              createHistory("check")
          });

        expect(result)
          .toEqual({
            foldProbability: 0.2,
            callProbability: 0.75,
            raiseProbability: 0.05
          });
      }
    );

    it(
      "creates a call-based response model",
      () => {
        const result =
          createOpponentResponseModelFromHistory({
            actionHistory:
              createHistory("call")
          });

        expect(result)
          .toEqual({
            foldProbability: 0.25,
            callProbability: 0.7,
            raiseProbability: 0.05
          });
      }
    );

    it(
      "creates a bet-based response model",
      () => {
        const result =
          createOpponentResponseModelFromHistory({
            actionHistory:
              createHistory("bet")
          });

        expect(result)
          .toEqual({
            foldProbability: 0.2,
            callProbability: 0.55,
            raiseProbability: 0.25
          });
      }
    );

    it(
      "creates a raise-based response model",
      () => {
        const result =
          createOpponentResponseModelFromHistory({
            actionHistory:
              createHistory("raise")
          });

        expect(result)
          .toEqual({
            foldProbability: 0.1,
            callProbability: 0.35,
            raiseProbability: 0.55
          });
      }
    );

    it(
      "creates an all-in-based response model",
      () => {
        const result =
          createOpponentResponseModelFromHistory({
            actionHistory:
              createHistory("all_in")
          });

        expect(result)
          .toEqual({
            foldProbability: 0.05,
            callProbability: 0.2,
            raiseProbability: 0.75
          });
      }
    );

    it(
      "uses the most recent action",
      () => {
        const result =
          createOpponentResponseModelFromHistory({
            actionHistory: {
              playerId: "villain",
              actions: [
                {
                  actionIndex: 0,
                  playerId: "villain",
                  type: "call",
                  amount: 100,
                  street: "preflop"
                },
                {
                  actionIndex: 1,
                  playerId: "villain",
                  type: "raise",
                  amount: 300,
                  street: "flop"
                }
              ]
            }
          });

        expect(result)
          .toEqual({
            foldProbability: 0.1,
            callProbability: 0.35,
            raiseProbability: 0.55
          });
      }
    );
  }
);