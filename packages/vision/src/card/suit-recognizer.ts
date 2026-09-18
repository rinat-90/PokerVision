import type {
  SymbolMask
} from "./symbol-mask.js";

import {
  symbolSimilarity
} from "./symbol-similarity.js";

export type CardSuit =
  | "hearts"
  | "diamonds"
  | "clubs"
  | "spades";

export interface SuitTemplate {
  suit: CardSuit;
  mask: SymbolMask;
}

export interface SuitRecognition {
  suit: CardSuit | null;
  confidence: number;
}

export interface SuitRecognizerOptions {
  minimumConfidence?: number;
}

export class SuitRecognizer {
  private readonly templates:
    SuitTemplate[];

  private readonly minimumConfidence:
    number;

  constructor(
    templates: SuitTemplate[],
    options:
    SuitRecognizerOptions = {}
  ) {
    this.templates =
      templates;

    this.minimumConfidence =
      options.minimumConfidence ??
      0.8;
  }

  recognize(
    mask: SymbolMask
  ): SuitRecognition {
    let bestSuit:
      CardSuit | null = null;

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
        bestSuit =
          template.suit;

        bestConfidence =
          confidence;
      }
    }

    if (
      bestConfidence <
      this.minimumConfidence
    ) {
      return {
        suit: null,
        confidence:
        bestConfidence
      };
    }

    return {
      suit:
      bestSuit,
      confidence:
      bestConfidence
    };
  }
}