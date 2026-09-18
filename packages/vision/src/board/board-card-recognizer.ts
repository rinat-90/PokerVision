import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  ImageDecoder
} from "../image/image-decoder.js";

import type {
  Region
} from "../seat/seat-layout.js";

import {
  cropFrame
} from "../table/crop-frame.js";

import {
  CardSymbolExtractor
} from "../card/card-symbol-extractor.js";

import {
  CardRecognizer,
  type CardRecognition
} from "../card/card-recognizer.js";

import {
  BoardCardDetector
} from "./board-card-detector.js";

export interface BoardCardRecognition {
  region: Region;
  recognition: CardRecognition;
}

export interface BoardCardRecognitionResult {
  cards: BoardCardRecognition[];
}

export class BoardCardRecognizer {
  private readonly detector:
    BoardCardDetector;

  private readonly symbolExtractor:
    CardSymbolExtractor;

  constructor(
    private readonly decoder:
      ImageDecoder,
    private readonly cardRecognizer:
      CardRecognizer,
    detector =
      new BoardCardDetector()
  ) {
    this.detector =
      detector;

    this.symbolExtractor =
      new CardSymbolExtractor(
        decoder
      );
  }

  async recognize(
    frame: VideoFrame,
    boardRegion: Region
  ): Promise<BoardCardRecognitionResult> {
    const boardFrame =
      await cropFrame(
        frame,
        boardRegion,
        this.decoder
      );

    const detection =
      this.detector.detect(
        boardFrame
      );

    const cards:
      BoardCardRecognition[] = [];

    for (
      const region
      of detection.regions
    ) {
      const symbols =
        await this.symbolExtractor.extract(
          frame,
          boardRegion,
          region
        );

      cards.push({
        region,
        recognition:
          this.cardRecognizer.recognize(
            symbols
          )
      });
    }

    return {
      cards
    };
  }
}