import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  ImageDecoder
} from "../image/image-decoder.js";

import {
  cropFrame
} from "../table/crop-frame.js";

import type {
  Region
} from "../seat/seat-layout.js";

import {
  createCardCornerRegion
} from "./card-corner-region.js";

import {
  createCardSymbolRegions
} from "./card-symbol-regions.js";

import {
  createSymbolMask,
  type SymbolMask
} from "./symbol-mask.js";

import {
  normalizeSymbolMask
} from "./normalize-symbol-mask.js";

export interface ExtractedCardSymbols {
  rank: SymbolMask;
  suit: SymbolMask;
}

export class CardSymbolExtractor {
  constructor(
    private readonly decoder:
    ImageDecoder
  ) {}

  async extract(
    frame: VideoFrame,
    boardRegion: Region,
    cardRegion: Region
  ): Promise<ExtractedCardSymbols> {
    const cornerRegion =
      createCardCornerRegion(
        cardRegion
      );

    const symbolRegions =
      createCardSymbolRegions(
        cornerRegion
      );

    const rankRegion = {
      x:
        boardRegion.x +
        symbolRegions.rank.x,
      y:
        boardRegion.y +
        symbolRegions.rank.y,
      width:
      symbolRegions.rank.width,
      height:
      symbolRegions.rank.height
    };

    const suitRegion = {
      x:
        boardRegion.x +
        symbolRegions.suit.x,
      y:
        boardRegion.y +
        symbolRegions.suit.y,
      width:
      symbolRegions.suit.width,
      height:
      symbolRegions.suit.height
    };

    const rankFrame =
      await cropFrame(
        frame,
        rankRegion,
        this.decoder
      );

    const suitFrame =
      await cropFrame(
        frame,
        suitRegion,
        this.decoder
      );

    const rankMask =
      normalizeSymbolMask(
        createSymbolMask(
          rankFrame
        )
      );

    const suitMask =
      normalizeSymbolMask(
        createSymbolMask(
          suitFrame
        )
      );

    return {
      rank: rankMask,
      suit: suitMask
    };
  }
}