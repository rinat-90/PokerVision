import {
  describe,
  expect,
  it
} from "vitest";

import {
  BetAmountRecognizer
} from "./bet-amount-recognizer.js";

function createFrame(
  width: number,
  height: number,
  value = 0
) {
  return {
    width,
    height,
    data: new Uint8Array(
      width *
      height *
      3
    ).fill(value)
  };
}

describe(
  "BetAmountRecognizer",
  () => {
    it(
      "rejects an empty amount region",
      () => {
        const recognizer =
          new BetAmountRecognizer();

        const result =
          recognizer.recognize(
            createFrame(
              20,
              10
            ),
            4
          );

        expect(
          result.seatIndex
        ).toBe(4);

        expect(
          result.hasText
        ).toBe(false);

        expect(
          result.matchingPixelRatio
        ).toBe(0);

        expect(
          result.confidence
        ).toBe(0);
      }
    );

    it(
      "detects bright text-like pixels",
      () => {
        const frame =
          createFrame(
            20,
            10
          );

        for (
          let i = 0;
          i < frame.data.length;
          i += 3
        ) {
          frame.data[i] = 255;
          frame.data[i + 1] = 255;
          frame.data[i + 2] = 255;
        }

        const recognizer =
          new BetAmountRecognizer();

        const result =
          recognizer.recognize(
            frame,
            2
          );

        expect(
          result.seatIndex
        ).toBe(2);

        expect(
          result.hasText
        ).toBe(true);

        expect(
          result.matchingPixelRatio
        ).toBe(1);

        expect(
          result.confidence
        ).toBe(1);
      }
    );
  }
);