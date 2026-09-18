import {
  describe,
  expect,
  it
} from "vitest";

import type {
  SourceFrame
} from "../source/frame-source.js";

import type {
  TableDetector
} from "../table/table-detector.js";

import type {
  BoardCardRecognitionResult
} from "../board/board-card-recognizer.js";

import type {
  RecognizedCard
} from "../card/card-recognizer.js";

import {
  LiveBoardProcessor,
  type LiveBoardRecognizer
} from "./live-board-processor.js";

function frame(
  index: number
): SourceFrame {
  return {
    index,
    width: 1920,
    height: 1080,
    timestampSeconds:
      index * 0.5,
    data:
      Buffer.from([
        1
      ])
  };
}

function card(
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

function recognition(
  cards: RecognizedCard[]
): BoardCardRecognitionResult {
  return {
    cards:
      cards.map(
        (
          recognizedCard,
          index
        ) => ({
          region: {
            x:
              index * 110,
            y: 0,
            width: 100,
            height: 140
          },

          recognition: {
            card:
            recognizedCard,
            rankConfidence: 1,
            suitConfidence: 1
          }
        })
      )
  };
}

class FakeTableDetector
  implements TableDetector {
  async detect(
    _frame: SourceFrame
  ) {
    return {
      found: true,
      confidence: 1,

      region: {
        x: 192,
        y: 324,
        width: 1536,
        height: 540
      }
    };
  }
}

class MissingTableDetector
  implements TableDetector {
  async detect(
    _frame: SourceFrame
  ) {
    return {
      found: false,
      confidence: 0,

      region: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      }
    };
  }
}

class FakeBoardRecognizer
  implements LiveBoardRecognizer {
  private index = 0;

  constructor(
    private readonly results:
    BoardCardRecognitionResult[]
  ) {}

  async recognize() {
    const result =
      this.results[
        this.index
        ];

    this.index++;

    if (!result) {
      return {
        cards: []
      };
    }

    return result;
  }
}

describe(
  "LiveBoardProcessor",
  () => {
    it(
      "emits a stable recognized flop",
      async () => {
        const flop = [
          card(
            "2",
            "hearts"
          ),
          card(
            "6",
            "hearts"
          ),
          card(
            "5",
            "hearts"
          )
        ];

        const processor =
          new LiveBoardProcessor(
            new FakeTableDetector(),
            new FakeBoardRecognizer([
              recognition([]),
              recognition(flop),
              recognition(flop)
            ])
          );

        const first =
          await processor.process(
            frame(0)
          );

        const second =
          await processor.process(
            frame(1)
          );

        const third =
          await processor.process(
            frame(2)
          );

        expect(
          first.event
        ).toBeNull();

        expect(
          second.event
        ).toBeNull();

        expect(
          third.state?.street
        ).toBe("flop");

        expect(
          third.event
        ).toEqual({
          type:
            "flopDealt",

          cards: flop
        });
      }
    );

    it(
      "emits a stable turn after the flop",
      async () => {
        const flop = [
          card(
            "2",
            "hearts"
          ),
          card(
            "6",
            "hearts"
          ),
          card(
            "5",
            "hearts"
          )
        ];

        const turn = [
          ...flop,
          card(
            "5",
            "clubs"
          )
        ];

        const processor =
          new LiveBoardProcessor(
            new FakeTableDetector(),
            new FakeBoardRecognizer([
              recognition([]),
              recognition(flop),
              recognition(flop),
              recognition(turn),
              recognition(turn)
            ])
          );

        await processor.process(
          frame(0)
        );

        await processor.process(
          frame(1)
        );

        const flopResult =
          await processor.process(
            frame(2)
          );

        await processor.process(
          frame(3)
        );

        const turnResult =
          await processor.process(
            frame(4)
          );

        expect(
          flopResult.event?.type
        ).toBe(
          "flopDealt"
        );

        expect(
          turnResult.state?.street
        ).toBe("turn");

        expect(
          turnResult.event
        ).toEqual({
          type:
            "turnDealt",

          card:
            turn[3]
        });
      }
    );

    it(
      "returns no board state when the table is not found",
      async () => {
        const tableDetector =
          new MissingTableDetector();

        const boardRecognizer =
          new FakeBoardRecognizer(
            []
          );

        const processor =
          new LiveBoardProcessor(
            tableDetector,
            boardRecognizer
          );

        const result =
          await processor.process(
            frame(0)
          );

        expect(
          result
        ).toEqual({
          timestampSeconds: 0,
          state: null,
          event: null
        });
      }
    );
  }
);