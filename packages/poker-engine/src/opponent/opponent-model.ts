import type {
  Card,
  Street
} from "../types.js";

import type {
  Player
} from "../game-state/types.js";

import type {
  Range
} from "../range/types.js";

import {
  createOpponentResponseModel
} from "./response-model.js";

import {
  buildOpponentRange
} from "./build-opponent-range.js";

import type {
  OpponentActionHistory
} from "./action-history.js";

import type {
  ActionRangeWeightModel
} from "./action-range-weight.js";

import type {
  OpponentContext,
  OpponentModel,
  OpponentResponseModel
} from "./types.js";

export interface CreateOpponentModelInput {
  player: Player;
  range: Range;
  response: {
    foldProbability: number;
    callProbability?: number;
    raiseProbability?: number;
  };
}

export function createOpponentModel(
  input: CreateOpponentModelInput
): OpponentModel {
  const response =
    createOpponentResponseModel(
      input.response
    );

  const opponent: OpponentContext = {
    playerId:
    input.player.id,

    playerName:
    input.player.name,

    position:
    input.player.position,

    stack:
    input.player.stack,

    status:
    input.player.status,

    range:
    input.range
  };

  return {
    opponent,
    response
  };
}

export function createDefaultOpponentResponseModel(): OpponentResponseModel {
  return createOpponentResponseModel({
    foldProbability: 0,
    callProbability: 1,
    raiseProbability: 0
  });
}

export interface BuildOpponentModelRangeInput {
  model: OpponentModel;
  actionHistory: OpponentActionHistory;
  board: Card[];
  street: Street;
  weightModel: ActionRangeWeightModel;
  knownCards?: Card[];
}

export function buildOpponentModelRange(
  input: BuildOpponentModelRangeInput
): OpponentModel {
  const result =
    buildOpponentRange({
      range:
      input.model.opponent.range,

      actionHistory:
      input.actionHistory,

      board:
      input.board,

      street:
      input.street,

      weightModel:
      input.weightModel,

      ...(input.knownCards !== undefined
        ? {
          knownCards:
          input.knownCards
        }
        : {})
    });

  return {
    opponent: {
      ...input.model.opponent,
      range:
      result.range
    },
    response:
    input.model.response
  };
}