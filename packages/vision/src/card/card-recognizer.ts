import type {
  SymbolMask
} from "./symbol-mask.js";

import {
  RankRecognizer,
  type CardRank
} from "./rank-recognizer.js";

import {
  SuitRecognizer,
  type CardSuit
} from "./suit-recognizer.js";

export interface CardSymbolMasks {
  rank: SymbolMask;
  suit: SymbolMask;
}

export interface RecognizedCard {
  rank: CardRank;
  suit: CardSuit;
  rankConfidence: number;
  suitConfidence: number;
  confidence: number;
}

export interface CardRecognition {
  card: RecognizedCard | null;
  rankConfidence: number;
  suitConfidence: number;
}

export class CardRecognizer {
  constructor(
    private readonly rankRecognizer:
    RankRecognizer,
    private readonly suitRecognizer:
    SuitRecognizer
  ) {}

  recognize(
    masks: CardSymbolMasks
  ): CardRecognition {
    const rankRecognition =
      this.rankRecognizer.recognize(
        masks.rank
      );

    const suitRecognition =
      this.suitRecognizer.recognize(
        masks.suit
      );

    if (
      !rankRecognition.rank ||
      !suitRecognition.suit
    ) {
      return {
        card: null,
        rankConfidence:
        rankRecognition.confidence,
        suitConfidence:
        suitRecognition.confidence
      };
    }

    return {
      card: {
        rank:
        rankRecognition.rank,
        suit:
        suitRecognition.suit,
        rankConfidence:
        rankRecognition.confidence,
        suitConfidence:
        suitRecognition.confidence,
        confidence:
          Math.min(
            rankRecognition.confidence,
            suitRecognition.confidence
          )
      },
      rankConfidence:
      rankRecognition.confidence,
      suitConfidence:
      suitRecognition.confidence
    };
  }
}