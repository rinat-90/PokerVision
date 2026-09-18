import type {
  RecognizedCard
} from "../card/card-recognizer.js";

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

export interface VideoHand {
  startedAt:
    number | null;

  completedAt:
    number | null;

  players:
    VideoHandPlayer[];

  streets:
    VideoHandStreet[];
}