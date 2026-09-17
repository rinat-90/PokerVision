import type {
  OpponentContext as EngineOpponentContext,
  OpponentResponseModel,
  Range
} from "@poker-vision/poker-engine";

import {
  buildOpponentModelRange,
  createActionRangeWeightModel,
  createOpponentActionHistory,
  createOpponentModel,
  createOpponentResponseModelFromHistory
} from "@poker-vision/poker-engine";

import type {
  HandStateSnapshot
} from "./replay-hand.js";

export interface CreateOpponentContextOptions {
  heroPlayerId: string;
  villainRange: Range;
}

export interface HandOpponent {
  opponent: EngineOpponentContext;
  response: OpponentResponseModel;
}

export interface HandOpponentContext {
  heroPlayerId: string;
  opponents: HandOpponent[];
}

export function createOpponentContext(
  snapshot: HandStateSnapshot,
  options: CreateOpponentContextOptions
): HandOpponentContext {
  const heroPlayer =
    snapshot.players.find(
      (player) =>
        player.id ===
        options.heroPlayerId
    );

  const knownCards =
    heroPlayer?.holeCards ?? [];

  const weightModel =
    createActionRangeWeightModel();

  const opponents =
    snapshot.players
      .filter(
        (player) =>
          player.id !==
          options.heroPlayerId &&
          player.status === "active"
      )
      .map(
        (player) => {
          const actionHistory =
            createOpponentActionHistory({
              playerId:
              player.id,
              actions:
              snapshot.actions,
              currentActionIndex:
              snapshot.actionIndex
            });

          const response =
            createOpponentResponseModelFromHistory({
              actionHistory
            });

          const opponentModel =
            createOpponentModel({
              player,
              range:
              options.villainRange,
              response
            });

          const rangedModel =
            buildOpponentModelRange({
              model:
              opponentModel,
              actionHistory,
              board:
              snapshot.board,
              street:
              snapshot.street,
              weightModel,
              ...(knownCards.length > 0
                ? {
                  knownCards
                }
                : {})
            });

          return {
            opponent:
            rangedModel.opponent,
            response
          };
        }
      );

  return {
    heroPlayerId:
    options.heroPlayerId,
    opponents
  };
}