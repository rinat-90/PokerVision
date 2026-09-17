import type {
  OpponentContext as EngineOpponentContext,
  Range
} from "@poker-vision/poker-engine";

import {
  createOpponentModel
} from "@poker-vision/poker-engine";

import type {
  HandStateSnapshot
} from "./replay-hand.js";

export interface CreateOpponentContextOptions {
  heroPlayerId: string;
  villainRange: Range;
}

export interface HandOpponentContext {
  heroPlayerId: string;
  opponents: EngineOpponentContext[];
}

export function createOpponentContext(
  snapshot: HandStateSnapshot,
  options: CreateOpponentContextOptions
): HandOpponentContext {
  const opponents =
    snapshot.players
      .filter(
        (player) =>
          player.id !==
          options.heroPlayerId &&
          player.status === "active"
      )
      .map(
        (player) =>
          createOpponentModel({
            player,
            range:
            options.villainRange,
            response: {
              foldProbability: 0,
              callProbability: 1,
              raiseProbability: 0
            }
          }).opponent
      );

  return {
    heroPlayerId:
    options.heroPlayerId,

    opponents
  };
}