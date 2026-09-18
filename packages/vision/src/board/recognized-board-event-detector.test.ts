import {
  describe,
  expect,
  it
} from "vitest";

import type {
  RecognizedCard
} from "../card/card-recognizer.js";

import {
  RecognizedBoardEventDetector
} from "./recognized-board-event-detector.js";

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
  "RecognizedBoardEventDetector",
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

    const turn =
      createCard(
        "5",
        "clubs"
      );

    it(
      "emits flop after stable detection",
      () => {
        const detector =
          new RecognizedBoardEventDetector({
            requiredStableFrames: 2
          });

        expect(
          detector.update(
            0,
            []
          ).event
        ).toBeNull();

        expect(
          detector.update(
            3,
            flop
          ).event
        ).toBeNull();

        expect(
          detector.update(
            3,
            flop
          ).event
        ).toEqual({
          type:
            "flopDealt",
          cards:
          flop
        });
      }
    );

    it(
      "emits only the new turn card",
      () => {
        const detector =
          new RecognizedBoardEventDetector({
            requiredStableFrames: 2
          });

        detector.update(
          0,
          []
        );

        detector.update(
          3,
          flop
        );

        detector.update(
          3,
          flop
        );

        expect(
          detector.update(
            4,
            [
              ...flop,
              turn
            ]
          ).event
        ).toBeNull();

        expect(
          detector.update(
            4,
            [
              ...flop,
              turn
            ]
          ).event
        ).toEqual({
          type:
            "turnDealt",
          card:
          turn
        });
      }
    );

    it(
      "does not emit when recognition is incomplete",
      () => {
        const detector =
          new RecognizedBoardEventDetector({
            requiredStableFrames: 2
          });

        detector.update(
          0,
          []
        );

        detector.update(
          3,
          flop.slice(
            0,
            2
          )
        );

        expect(
          detector.update(
            3,
            flop.slice(
              0,
              2
            )
          ).event
        ).toBeNull();
      }
    );

    it(
      "does not emit repeatedly for the same street",
      () => {
        const detector =
          new RecognizedBoardEventDetector({
            requiredStableFrames: 2
          });

        detector.update(
          0,
          []
        );

        detector.update(
          3,
          flop
        );

        expect(
          detector.update(
            3,
            flop
          ).event
        ).not.toBeNull();

        expect(
          detector.update(
            3,
            flop
          ).event
        ).toBeNull();
      }
    );
  }
);