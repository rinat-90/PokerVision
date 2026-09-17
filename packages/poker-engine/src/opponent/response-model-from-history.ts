import type {
  OpponentResponseModel
} from "./types.js";

import type {
  OpponentActionHistory
} from "./action-history.js";

import {
  createOpponentResponseModel
} from "./response-model.js";

export interface CreateOpponentResponseModelFromHistoryInput {
  actionHistory: OpponentActionHistory;
}

export function createOpponentResponseModelFromHistory(
  input: CreateOpponentResponseModelFromHistoryInput
): OpponentResponseModel {
  const actions =
    input.actionHistory.actions;

  if (actions.length === 0) {
    return createOpponentResponseModel({
      foldProbability: 0.33,
      callProbability: 0.67,
      raiseProbability: 0
    });
  }

  const lastAction =
    actions[actions.length - 1];

  if (lastAction === undefined) {
    return createOpponentResponseModel({
      foldProbability: 0.33,
      callProbability: 0.67,
      raiseProbability: 0
    });
  }

  switch (lastAction.type) {
    case "fold":
      return createOpponentResponseModel({
        foldProbability: 1,
        callProbability: 0,
        raiseProbability: 0
      });

    case "check":
      return createOpponentResponseModel({
        foldProbability: 0.2,
        callProbability: 0.75,
        raiseProbability: 0.05
      });

    case "call":
      return createOpponentResponseModel({
        foldProbability: 0.25,
        callProbability: 0.7,
        raiseProbability: 0.05
      });

    case "bet":
      return createOpponentResponseModel({
        foldProbability: 0.2,
        callProbability: 0.55,
        raiseProbability: 0.25
      });

    case "raise":
      return createOpponentResponseModel({
        foldProbability: 0.1,
        callProbability: 0.35,
        raiseProbability: 0.55
      });

    case "all_in":
      return createOpponentResponseModel({
        foldProbability: 0.05,
        callProbability: 0.2,
        raiseProbability: 0.75
      });
  }
}