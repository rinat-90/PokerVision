import {
  describe,
  expect,
  it
} from "vitest";

import {
  NullBetAmountOcr
} from "./bet-amount-ocr.js";

describe(
  "NullBetAmountOcr",
  () => {
    it(
      "returns an empty OCR result",
      async () => {
        const ocr =
          new NullBetAmountOcr();

        const result =
          await ocr.recognize(
            Buffer.alloc(10 * 10 * 3),
            5
          );

        expect(
          result
        ).toEqual({
          seatIndex: 5,
          rawText: null,
          parsed: {
            value: null,
            rawText: "",
            confidence: 0
          },
          confidence: 0
        });
      }
    );
  }
);