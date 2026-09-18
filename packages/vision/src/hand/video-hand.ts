import type {
  RecognizedCard
} from "../card/card-recognizer.js";

import type {
  PlayerActionType
} from "../action/player-action-classifier.js";

import type {
  PokerStreet
} from "../action/player-action-context.js";

export interface VideoHandPlayer {
  seatIndex: number;
  hasCards: boolean;
}

export interface VideoHandStreet {
  street:
    | "flop"
    | "turn"
    | "river";

  board: RecognizedCard[];

  timestampSeconds: number;
}

export interface VideoHandAction {
  seatIndex: number;

  street: PokerStreet;

  type: PlayerActionType;

  amount: number | null;

  timestampSeconds: number;
}

export interface VideoHand {
  startedAt:
    number | null;

  completedAt:
    number | null;

  players:
    VideoHandPlayer[];

  streets:
    VideoHandStreet[];

  actions:
    VideoHandAction[];
}