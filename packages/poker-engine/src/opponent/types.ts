import type {
  Position,
  PlayerStatus
} from "../game-state/types.js";

import type {
  Range
} from "../range/types.js";

export interface OpponentContext {
  playerId: string;
  playerName: string;
  position: Position;
  stack: number;
  status: PlayerStatus;
  range: Range;
}

export interface OpponentResponseModel {
  foldProbability: number;
  callProbability: number;
  raiseProbability: number;
}

export interface OpponentModel {
  opponent: OpponentContext;
  response: OpponentResponseModel;
}