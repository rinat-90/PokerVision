import {
  describe,
  expect,
  it
} from "vitest";

import type {
  RecognizedCard
} from "../card/card-recognizer.js";

import {
  createRecognizedBoardEvent
} from "./recognized-board-event.js";

function createCard(
  rank: RecognizedCard["rank"],
  suit: RecognizedCard["suit"]
): RecognizedCard {
  return {
    rank,
    suit,
    rankConfidence: 1,
    suitConfidence: 1,
    confidence: 1
  };
}

describe(
  "createRecognizedBoardEvent",
  () => {
    const flop = [
      createCard(
        "2",
        "hearts"
      ),
      createCard(
        "6",
        "hearts"
      ),
      createCard(
        "5",
        "hearts"
      )
    ];

    it(
      "creates a recognized flop event",
      () => {
        expect(
          createRecognizedBoardEvent(
            {
              type:
                "flopDealt",
              cardCount: 3
            },
            flop
          )
        ).toEqual({
          type:
            "flopDealt",
          cards: flop
        });
      }
    );

    it(
      "creates a recognized turn event",
      () => {
        const turn =
          createCard(
            "5",
            "clubs"
          );

        expect(
          createRecognizedBoardEvent(
            {
              type:
                "turnDealt",
              cardCount: 4
            },
            [
              ...flop,
              turn
            ]
          )
        ).toEqual({
          type:
            "turnDealt",
          card: turn
        });
      }
    );

    it(
      "creates a recognized river event",
      () => {
        const turn =
          createCard(
            "5",
            "clubs"
          );

        const river =
          createCard(
            "A",
            "spades"
          );

        expect(
          createRecognizedBoardEvent(
            {
              type:
                "riverDealt",
              cardCount: 5
            },
            [
              ...flop,
              turn,
              river
            ]
          )
        ).toEqual({
          type:
            "riverDealt",
          card: river
        });
      }
    );

    it(
      "returns null when flop recognition is incomplete",
      () => {
        expect(
          createRecognizedBoardEvent(
            {
              type:
                "flopDealt",
              cardCount: 3
            },
            flop.slice(
              0,
              2
            )
          )
        ).toBeNull();
      }
    );

    it(
      "returns null when turn card is missing",
      () => {
        expect(
          createRecognizedBoardEvent(
            {
              type:
                "turnDealt",
              cardCount: 4
            },
            flop
          )
        ).toBeNull();
      }
    );

    it(
      "returns null when river card is missing",
      () => {
        expect(
          createRecognizedBoardEvent(
            {
              type:
                "riverDealt",
              cardCount: 5
            },
            [
              ...flop,
              createCard(
                "5",
                "clubs"
              )
            ]
          )
        ).toBeNull();
      }
    );
  }
);