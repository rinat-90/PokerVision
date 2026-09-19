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

function createSolidFrame(
  width: number,
  height: number,
  pixel: [
    number,
    number,
    number
  ]
): CroppedFrame {
  const data =
    new Uint8Array(
      width *
      height *
      3
    );

  for (
    let index = 0;
    index < width * height;
    index += 1
  ) {
    const dataIndex =
      index * 3;

    data[dataIndex] =
      pixel[0];

    data[dataIndex + 1] =
      pixel[1];

    data[dataIndex + 2] =
      pixel[2];
  }

  return {
    width,
    height,
    channels: 3,
    data
  };
}

function createChipFrame(): CroppedFrame {
  const frame =
    createSolidFrame(
      10,
      10,
      [
        40,
        40,
        40
      ]
    );

  for (
    let y = 3;
    y <= 6;
    y += 1
  ) {
    for (
      let x = 3;
      x <= 6;
      x += 1
    ) {
      const index =
        (
          y *
          frame.width +
          x
        ) * 3;

      frame.data[index] =
        20;

      frame.data[index + 1] =
        100;

      frame.data[index + 2] =
        220;
    }
  }

  return frame;
}

function createNoChipFrame(): CroppedFrame {
  return createSolidFrame(
    4,
    4,
    [
      40,
      40,
      40
    ]
  );
}

function createTinyBlueNoiseFrame():
  CroppedFrame {
  const frame =
    createNoChipFrame();

  frame.data[0] = 20;
  frame.data[1] = 100;
  frame.data[2] = 220;

  return frame;
}

function createAmountFrame():
  CroppedFrame {
  return createSolidFrame(
    4,
    4,
    [
      255,
      255,
      255
    ]
  );
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

        const result =
          await detector.detect(
            createNoChipFrame(),
            createAmountFrame(),
            0
          );

        expect(
          result.chipPresent
        ).toBe(false);

        expect(
          result.chipRegion
        ).toBeNull();

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
      "does not run OCR when blue pixels do not form a valid chip component",
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

        const result =
          await detector.detect(
            createTinyBlueNoiseFrame(),
            createAmountFrame(),
            0
          );

        expect(
          result.chipPresent
        ).toBe(false);

        expect(
          result.chipRegion
        ).toBeNull();

        expect(
          result.amount
        ).toBeNull();

        expect(
          recognize
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "runs OCR when a valid bet chip component is present",
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

        const result =
          await detector.detect(
            createChipFrame(),
            createAmountFrame(),
            4
          );

        expect(
          result.chipPresent
        ).toBe(true);

        expect(
          result.chipRegion
        ).toEqual({
          x: 3,
          y: 3,
          width: 4,
          height: 4
        });

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

        const result =
          await detector.detect(
            createChipFrame(),
            createAmountFrame(),
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

        const result =
          await detector.detect(
            createChipFrame(),
            createAmountFrame(),
            5
          );

        expect(
          result.chipPresent
        ).toBe(true);

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

        const result =
          await detector.detect(
            createChipFrame(),
            createAmountFrame(),
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