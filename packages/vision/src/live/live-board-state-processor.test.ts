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
  ImageDecoder
} from "../image/image-decoder.js";

import {
  LiveBoardStateProcessor
} from "./live-board-state-processor.js";

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
        index
      ])
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

class FakeImageDecoder
  implements ImageDecoder {
  private index = 0;

  constructor(
    private readonly cardCounts:
    number[]
  ) {}

  async decode(
    _data: Uint8Array
  ) {
    const width = 1920;
    const height = 1080;
    const channels = 3;

    const data =
      new Uint8Array(
        width *
        height *
        channels
      );

    const count =
      this.cardCounts[
        this.index
        ] ?? 0;

    this.index++;

    // createBoardRegion() for:
    //
    // table:
    // x: 192
    // y: 324
    // width: 1536
    // height: 540
    //
    // produces approximately:
    //
    // x: 576
    // y: 473
    // width: 768
    // height: 243

    const boardX = 576;
    const boardY = 473;

    for (
      let cardIndex = 0;
      cardIndex < count;
      cardIndex++
    ) {
      const startX =
        boardX +
        40 +
        cardIndex * 120;

      const startY =
        boardY +
        30;

      for (
        let y = startY;
        y < startY + 150;
        y++
      ) {
        for (
          let x = startX;
          x < startX + 100;
          x++
        ) {
          const offset =
            (
              y *
              width +
              x
            ) *
            channels;

          data[offset] =
            255;

          data[
          offset + 1
            ] = 255;

          data[
          offset + 2
            ] = 255;
        }
      }
    }

    return {
      data,
      width,
      height,
      channels
    };
  }
}

describe(
  "LiveBoardStateProcessor",
  () => {
    it(
      "tracks stable board streets",
      async () => {
        const processor =
          new LiveBoardStateProcessor(
            new FakeTableDetector(),
            new FakeImageDecoder([
              0,
              3,
              3,
              4,
              4,
              5,
              5
            ])
          );

        const states = [];

        for (
          let index = 0;
          index < 7;
          index++
        ) {
          states.push(
            await processor.process(
              frame(index)
            )
          );
        }

        expect(
          states[0]?.state?.street
        ).toBe(
          "preflop"
        );

        expect(
          states[1]?.changed
        ).toBe(false);

        expect(
          states[2]?.state?.street
        ).toBe(
          "flop"
        );

        expect(
          states[2]?.changed
        ).toBe(true);

        expect(
          states[4]?.state?.street
        ).toBe(
          "turn"
        );

        expect(
          states[4]?.changed
        ).toBe(true);

        expect(
          states[6]?.state?.street
        ).toBe(
          "river"
        );

        expect(
          states[6]?.changed
        ).toBe(true);
      }
    );

    it(
      "returns no state when table is not found",
      async () => {
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

        const processor =
          new LiveBoardStateProcessor(
            new MissingTableDetector(),
            new FakeImageDecoder([])
          );

        expect(
          await processor.process(
            frame(0)
          )
        ).toEqual({
          timestampSeconds: 0,
          state: null,
          changed: false
        });
      }
    );
    it(
      "does not regress within the same hand",
      async () => {
        const processor =
          new LiveBoardStateProcessor(
            new FakeTableDetector(),
            new FakeImageDecoder([
              0,
              3,
              3,
              4,
              4,
              3,
              3,
              0,
              0,
              5,
              5
            ])
          );

        const states = [];

        for (
          let index = 0;
          index < 11;
          index++
        ) {
          states.push(
            await processor.process(
              frame(index)
            )
          );
        }

        expect(
          states[4]?.state?.street
        ).toBe(
          "turn"
        );

        expect(
          states[6]?.state?.street
        ).toBe(
          "turn"
        );

        expect(
          states[8]?.state?.street
        ).toBe(
          "turn"
        );

        expect(
          states[10]?.state?.street
        ).toBe(
          "river"
        );
      }
    );

    it(
      "allows preflop again after reset",
      async () => {
        const processor =
          new LiveBoardStateProcessor(
            new FakeTableDetector(),
            new FakeImageDecoder([
              0,
              3,
              3,
              0,
              0
            ])
          );

        await processor.process(
          frame(0)
        );

        await processor.process(
          frame(1)
        );

        const flop =
          await processor.process(
            frame(2)
          );

        expect(
          flop.state?.street
        ).toBe(
          "flop"
        );

        processor.reset();

        const preflop =
          await processor.process(
            frame(3)
          );

        expect(
          preflop.state?.street
        ).toBe(
          "preflop"
        );

        expect(
          preflop.changed
        ).toBe(false);
      }
    );
  }
);