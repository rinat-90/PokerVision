import {
  cropFrame
} from "../table/crop-frame.js";

import {
  type CardRegion
} from "../card/types.js";

import {
  type WhiteCardDetector
} from "../card/white-card-detector.js";

import {
  type SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import {
  type SeatRegion
} from "./seat-region.js";

export interface DetectedSeat {
  index: number;
  region: SeatRegion;
  hasCards: boolean;
  cardRegions: CardRegion[];
  confidence: number;
}

export class SeatDetector {
  constructor(
    private readonly decoder:
    SharpImageDecoder,
    private readonly cardDetector:
    WhiteCardDetector
  ) {}

  async detect(
    frame: Parameters<
      typeof cropFrame
    >[0],
    seatRegions: SeatRegion[]
  ): Promise<DetectedSeat[]> {
    const seats:
      DetectedSeat[] = [];

    for (
      const seatRegion
      of seatRegions
      ) {
      const cropped =
        await cropFrame(
          frame,
          seatRegion,
          this.decoder
        );

      const cardDetection =
        await this.cardDetector.detect(
          cropped
        );

      seats.push({
        index:
        seatRegion.index,
        region:
        seatRegion,
        hasCards:
        cardDetection.found,
        cardRegions:
        cardDetection.regions,
        confidence:
        cardDetection.confidence
      });
    }

    return seats;
  }
}