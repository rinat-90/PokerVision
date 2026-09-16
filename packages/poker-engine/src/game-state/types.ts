import type { Card, Street } from "../types.js";

export type GameFormat =
  | "cash"
  | "tournament"
  | "sit_and_go";

export type Position =
  | "UTG"
  | "UTG+1"
  | "MP"
  | "HJ"
  | "CO"
  | "BTN"
  | "SB"
  | "BB";

export type PlayerStatus =
  | "active"
  | "folded"
  | "all_in"
  | "out";

export type ActionType =
  | "fold"
  | "check"
  | "call"
  | "bet"
  | "raise"
  | "all_in";

export interface Player {
  id: string;
  name: string;
  position: Position;
  stack: number;
  status: PlayerStatus;
  holeCards?: [Card, Card];
}

export interface PlayerAction {
  playerId: string;
  type: ActionType;
  amount: number;
  street: Street;
  timestamp?: number;
}

export interface Pot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface PotResult {
  pots: Pot[];
}

export interface HandState {
  id: string;
  gameFormat: GameFormat;
  street: Street;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  players: Player[];
  board: Card[];
  pot: number;
  actions: PlayerAction[];
  currentPlayerId: string | null;
  playersToAct: string[];
  currentBet: number;
  minimumRaise: number;
  lastAggressorId: string | null;

  /**
   * Amount contributed by each player during
   * the current betting street.
   */
  playerContributions: Record<string, number>;

  /**
   * Total amount contributed by each player
   * during the entire hand.
   *
   * Unlike playerContributions, this value is
   * NOT reset when the hand moves to a new street.
   */
  totalContributions: Record<string, number>;

  bettingRoundComplete: boolean;
  startedAt?: number;
  completedAt?: number;
}