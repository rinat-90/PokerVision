import {
  describe,
  expect,
  it,
  vi
} from "vitest";

import type {
  CroppedFrame
} from "../table/crop-frame.js";

import type {
  BetAmountOcr
} from "./bet-amount-ocr.js";

import {
  BetAmountDetector
} from "./bet-amount-detector.js";

function createFrame(
  pixels: number[]
): CroppedFrame {
  return {
    width: 1,
    height: 1,
    channels: 3,
    data:
      new Uint8Array(
        pixels
      )
  };
}

describe(
  "BetAmountDetector",
  () => {
    it(
      "does not run OCR when no bet chip is present",
      async () => {
        const recognize =
          vi.fn();

        const ocr: BetAmountOcr = {
          recognize
        };

        const detector =
          new BetAmountDetector(
            ocr
          );

        const actionFrame =
          createFrame([
            40,
            40,
            40
          ]);

        const amountFrame =
          createFrame([
            255,
            255,
            255
          ]);

        const result =
          await detector.detect(
            actionFrame,
            amountFrame,
            0
          );

        expect(
          result.chipPresent
        ).toBe(false);

        expect(
          result.amount
        ).toBeNull();

        expect(
          result.rawText
        ).toBeNull();

        expect(
          result.confidence
        ).toBe(0);

        expect(
          recognize
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "runs OCR when a bet chip is present",
      async () => {
        const recognize =
          vi.fn(
            async () => ({
              seatIndex: 4,
              rawText: "1,900",
              parsed: {
                value: 1900,
                rawText: "1,900",
                confidence: 1
              },
              confidence: 0.8
            })
          );

        const ocr: BetAmountOcr = {
          recognize
        };

        const detector =
          new BetAmountDetector(
            ocr
          );

        const actionFrame =
          createFrame([
            20,
            100,
            220
          ]);

        const amountFrame =
          createFrame([
            255,
            255,
            255
          ]);

        const result =
          await detector.detect(
            actionFrame,
            amountFrame,
            4
          );

        expect(
          result.chipPresent
        ).toBe(true);

        expect(
          result.amount
        ).toBe(1900);

        expect(
          result.rawText
        ).toBe("1,900");

        expect(
          result.confidence
        ).toBe(0.8);

        expect(
          recognize
        ).toHaveBeenCalledTimes(1);
      }
    );

    it(
      "keeps a valid parsed amount when OCR confidence is zero",
      async () => {
        const recognize =
          vi.fn(
            async () => ({
              seatIndex: 4,
              rawText: "1,900",
              parsed: {
                value: 1900,
                rawText: "1,900",
                confidence: 1
              },
              confidence: 0
            })
          );

        const ocr: BetAmountOcr = {
          recognize
        };

        const detector =
          new BetAmountDetector(
            ocr
          );

        const actionFrame =
          createFrame([
            20,
            100,
            220
          ]);

        const amountFrame =
          createFrame([
            255,
            255,
            255
          ]);

        const result =
          await detector.detect(
            actionFrame,
            amountFrame,
            4
          );

        expect(
          result.chipPresent
        ).toBe(true);

        expect(
          result.amount
        ).toBe(1900);

        expect(
          result.rawText
        ).toBe("1,900");

        expect(
          result.confidence
        ).toBe(0);
      }
    );

    it(
      "keeps a valid parsed amount with zero confidence for upper seats",
      async () => {
        const recognize =
          vi.fn(
            async () => ({
              seatIndex: 5,
              rawText: "600",
              parsed: {
                value: 600,
                rawText: "600",
                confidence: 1
              },
              confidence: 0
            })
          );

        const ocr: BetAmountOcr = {
          recognize
        };

        const detector =
          new BetAmountDetector(
            ocr
          );

        const actionFrame =
          createFrame([
            20,
            100,
            220
          ]);

        const amountFrame =
          createFrame([
            255,
            255,
            255
          ]);

        const result =
          await detector.detect(
            actionFrame,
            amountFrame,
            5
          );

        expect(
          result.amount
        ).toBe(600);

        expect(
          result.confidence
        ).toBe(0);
      }
    );

    it(
      "returns null amount when OCR text cannot be parsed",
      async () => {
        const recognize =
          vi.fn(
            async () => ({
              seatIndex: 4,
              rawText: "abc",
              parsed: {
                value: null,
                rawText: "abc",
                confidence: 0
              },
              confidence: 0.95
            })
          );

        const ocr: BetAmountOcr = {
          recognize
        };

        const detector =
          new BetAmountDetector(
            ocr
          );

        const actionFrame =
          createFrame([
            20,
            100,
            220
          ]);

        const amountFrame =
          createFrame([
            255,
            255,
            255
          ]);

        const result =
          await detector.detect(
            actionFrame,
            amountFrame,
            4
          );

        expect(
          result.chipPresent
        ).toBe(true);

        expect(
          result.amount
        ).toBeNull();

        expect(
          result.rawText
        ).toBe("abc");

        expect(
          result.confidence
        ).toBe(0.95);
      }
    );
  }
);