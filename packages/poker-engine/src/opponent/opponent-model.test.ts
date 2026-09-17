import {
  describe,
  expect,
  it
} from "vitest";

import {
  createOpponentModel
} from "./opponent-model.js";

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
  }
);