import type {
  SymbolMask
} from "./symbol-mask.js";

import {
  symbolSimilarity
} from "./symbol-similarity.js";

export type CardRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface RankTemplate {
  rank: CardRank;
  mask: SymbolMask;
}

export interface RankRecognition {
  rank: CardRank | null;
  confidence: number;
}

export interface RankRecognizerOptions {
  minimumConfidence?: number;
  fallbackConfidence?: number;
  minimumMargin?: number;
}

export class RankRecognizer {
  private readonly templates:
    RankTemplate[];

  private readonly minimumConfidence:
    number;

  private readonly fallbackConfidence:
    number;

  private readonly minimumMargin:
    number;

  constructor(
    templates: RankTemplate[],
    options:
    RankRecognizerOptions = {}
  ) {
    this.templates =
      templates;

    this.minimumConfidence =
      options.minimumConfidence ??
      0.9;

    this.fallbackConfidence =
      options.fallbackConfidence ??
      0.85;

    this.minimumMargin =
      options.minimumMargin ??
      0.05;
  }

  recognize(
    mask: SymbolMask
  ): RankRecognition {
    let bestRank:
      CardRank | null = null;

    let bestConfidence = 0;
    let secondBestConfidence = 0;

    for (
      const template
      of this.templates
      ) {
      const confidence =
        symbolSimilarity(
          mask,
          template.mask
        );

      if (
        confidence >
        bestConfidence
      ) {
        secondBestConfidence =
          bestConfidence;

        bestRank =
          template.rank;

        bestConfidence =
          confidence;

        continue;
      }

      if (
        confidence >
        secondBestConfidence
      ) {
        secondBestConfidence =
          confidence;
      }
    }

    if (
      bestRank === null
    ) {
      return {
        rank: null,
        confidence: 0
      };
    }

    if (
      bestConfidence >=
      this.minimumConfidence
    ) {
      return {
        rank:
        bestRank,
        confidence:
        bestConfidence
      };
    }

    const margin =
      bestConfidence -
      secondBestConfidence;

    if (
      bestConfidence >=
      this.fallbackConfidence &&
      margin >=
      this.minimumMargin
    ) {
      return {
        rank:
        bestRank,
        confidence:
        bestConfidence
      };
    }

    return {
      rank: null,
      confidence:
      bestConfidence
    };
  }
}