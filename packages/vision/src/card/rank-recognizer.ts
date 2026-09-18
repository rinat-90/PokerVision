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
}

export class RankRecognizer {
  private readonly templates:
    RankTemplate[];

  private readonly minimumConfidence:
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
  }

  recognize(
    mask: SymbolMask
  ): RankRecognition {
    let bestRank:
      CardRank | null = null;

    let bestConfidence = 0;

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
        bestRank =
          template.rank;

        bestConfidence =
          confidence;
      }
    }

    if (
      bestConfidence <
      this.minimumConfidence
    ) {
      return {
        rank: null,
        confidence:
        bestConfidence
      };
    }

    return {
      rank:
      bestRank,
      confidence:
      bestConfidence
    };
  }
}