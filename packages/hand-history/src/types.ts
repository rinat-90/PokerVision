import type {
  ActionType,
  GameFormat,
  Position,
  Card,
  Street
} from "@poker-vision/poker-engine";

export type HandHistoryAmountType =
  | "contribution"
  | "total";

export type HandHistoryForcedBetType =
  | "small_blind"
  | "big_blind"
  | "ante";

export interface HandHistoryForcedBet {
  playerId: string;
  type: HandHistoryForcedBetType;
  amount: number;
}

export interface HandHistoryPlayer {
  id: string;
  name: string;
  position: Position;
  startingStack: number;
  holeCards?: [Card, Card];
}

export interface HandHistoryAction {
  playerId: string;
  type: ActionType;
  amount: number;
  amountType: HandHistoryAmountType;
  street: Street;
}

export interface HandHistoryStreet {
  street: Street;
  board: Card[];
  actions: HandHistoryAction[];
}

export interface HandHistory {
  id: string;
  gameFormat: GameFormat;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  players: HandHistoryPlayer[];
  forcedBets?: HandHistoryForcedBet[];
  streets: HandHistoryStreet[];
  startedAt?: number;
  completedAt?: number;
}