import type {
  Player
} from "../game-state/types.js";

import type {
  Range
} from "../range/types.js";

import {
  createOpponentResponseModel
} from "./response-model.js";

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