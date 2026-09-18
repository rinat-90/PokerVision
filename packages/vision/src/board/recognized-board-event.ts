import type {
  RecognizedCard
} from "../card/card-recognizer.js";

import type {
  BoardEvent
} from "./board-event-detector.js";

export type RecognizedBoardEvent =
  | {
  type: "flopDealt";
  cards: [
    RecognizedCard,
    RecognizedCard,
    RecognizedCard
  ];
}
  | {
  type: "turnDealt";
  card: RecognizedCard;
}
  | {
  type: "riverDealt";
  card: RecognizedCard;
};

export function createRecognizedBoardEvent(
  event: BoardEvent,
  cards: RecognizedCard[]
): RecognizedBoardEvent | null {
  switch (event.type) {
    case "flopDealt": {
      const first =
        cards[0];

      const second =
        cards[1];

      const third =
        cards[2];

      if (
        !first ||
        !second ||
        !third
      ) {
        return null;
      }

      return {
        type: "flopDealt",
        cards: [
          first,
          second,
          third
        ]
      };
    }

    case "turnDealt": {
      const turn =
        cards[3];

      if (!turn) {
        return null;
      }

      return {
        type: "turnDealt",
        card: turn
      };
    }

    case "riverDealt": {
      const river =
        cards[4];

      if (!river) {
        return null;
      }

      return {
        type: "riverDealt",
        card: river
      };
    }
  }
}