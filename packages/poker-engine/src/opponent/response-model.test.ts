import {
  describe,
  expect,
  it
} from "vitest";

import {
  createOpponentResponseModel
} from "./response-model.js";

describe(
  "createOpponentResponseModel",
  () => {
    it(
      "creates a response model",
      () => {
        const result =
          createOpponentResponseModel({
            foldProbability: 0.3
          });

        expect(result)
          .toEqual({
            foldProbability: 0.3,
            callProbability: 0.7,
            raiseProbability: 0
          });
      }
    );

    it(
      "accepts explicit probabilities",
      () => {
        const result =
          createOpponentResponseModel({
            foldProbability: 0.3,
            callProbability: 0.5,
            raiseProbability: 0.2
          });

        expect(result)
          .toEqual({
            foldProbability: 0.3,
            callProbability: 0.5,
            raiseProbability: 0.2
          });
      }
    );

    it(
      "rejects probability below zero",
      () => {
        expect(() =>
          createOpponentResponseModel({
            foldProbability: -0.1
          })
        ).toThrow(
          "Fold probability must be between 0 and 1"
        );
      }
    );

    it(
      "rejects probability above one",
      () => {
        expect(() =>
          createOpponentResponseModel({
            foldProbability: 1.1
          })
        ).toThrow(
          "Fold probability must be between 0 and 1"
        );
      }
    );

    it(
      "requires probabilities to sum to one",
      () => {
        expect(() =>
          createOpponentResponseModel({
            foldProbability: 0.3,
            callProbability: 0.3,
            raiseProbability: 0.3
          })
        ).toThrow(
          "Opponent response probabilities must sum to 1"
        );
      }
    );
  }
);