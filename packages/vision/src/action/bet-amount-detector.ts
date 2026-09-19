import type {
  CroppedFrame
} from "../table/crop-frame.js";

import {
  BetChipDetector
} from "./bet-chip-detector.js";

import type {
  BetChipRegion
} from "./bet-chip-detector.js";

import type {
  BetAmountOcr,
  BetAmountOcrResult
} from "./bet-amount-ocr.js";

import {
  BetAmountOcrPreprocessor
} from "./bet-amount-ocr-preprocessor.js";

export interface BetAmountDetection {
  seatIndex: number;
  chipPresent: boolean;
  chipMatchingPixelRatio: number;
  chipRegion: BetChipRegion | null;
  amount: number | null;
  rawText: string | null;
  confidence: number;
}

export interface BetAmountDetectorOptions {
  chipDetector?: BetChipDetector;
  preprocessor?: BetAmountOcrPreprocessor;
}

export class BetAmountDetector {
  private readonly chipDetector:
    BetChipDetector;

  private readonly preprocessor:
    BetAmountOcrPreprocessor;

  private readonly ocr:
    BetAmountOcr;

  constructor(
    ocr: BetAmountOcr,
    options:
    BetAmountDetectorOptions = {}
  ) {
    this.ocr =
      ocr;

    this.chipDetector =
      options.chipDetector ??
      new BetChipDetector();

    this.preprocessor =
      options.preprocessor ??
      new BetAmountOcrPreprocessor();
  }

  async detect(
    actionFrame: CroppedFrame,
    amountFrame: CroppedFrame,
    seatIndex: number
  ): Promise<BetAmountDetection> {
    const chipDetection =
      this.chipDetector.detect(
        actionFrame
      );

    if (!chipDetection.present) {
      return {
        seatIndex,

        chipPresent:
          false,

        chipMatchingPixelRatio:
        chipDetection.matchingPixelRatio,

        chipRegion:
          null,

        amount:
          null,

        rawText:
          null,

        confidence:
          0
      };
    }

    const image =
      await this.preprocessor.preprocess(
        amountFrame
      );

    const ocrResult:
      BetAmountOcrResult =
      await this.ocr.recognize(
        image,
        seatIndex
      );

    return {
      seatIndex,

      chipPresent:
        true,

      chipMatchingPixelRatio:
      chipDetection.matchingPixelRatio,

      chipRegion:
      chipDetection.region,

      amount:
      ocrResult.parsed.value,

      rawText:
      ocrResult.rawText,

      confidence:
      ocrResult.confidence
    };
  }
}