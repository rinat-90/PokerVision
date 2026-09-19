import type {
  CroppedFrame
} from "../table/crop-frame.js";

import {
  BetChipDetector
} from "./bet-chip-detector.js";

import type {
  BetChipRegion
} from "./bet-chip-detector.js";

import {
  BetChipComponentSelector
} from "./bet-chip-component-selector.js";

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
  chipSelector?: BetChipComponentSelector;
  preprocessor?: BetAmountOcrPreprocessor;
}

export class BetAmountDetector {
  private readonly chipDetector:
    BetChipDetector;

  private readonly chipSelector:
    BetChipComponentSelector;

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

    this.chipSelector =
      options.chipSelector ??
      new BetChipComponentSelector();

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

    const components =
      this.chipDetector.detectComponents(
        actionFrame
      );

    const selectedComponent =
      this.chipSelector.select({
        components,
        seatIndex,

        frameWidth:
        actionFrame.width,

        frameHeight:
        actionFrame.height
      });

    const chipPresent =
      chipDetection.present &&
      selectedComponent !== null;

    if (!chipPresent) {
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
      selectedComponent.region,

      amount:
      ocrResult.parsed.value,

      rawText:
      ocrResult.rawText,

      confidence:
      ocrResult.confidence
    };
  }
}