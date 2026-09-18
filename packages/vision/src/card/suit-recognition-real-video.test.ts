import {
  describe,
  expect,
  it
} from "vitest";

import {
  fileURLToPath
} from "node:url";

import {
  extractFrames
} from "@poker-vision/video";

import {
  SharpImageDecoder
} from "../image/sharp-image-decoder.js";

import {
  PurpleTableDetector
} from "../table/purple-table-detector.js";

import {
  cropFrame
} from "../table/crop-frame.js";

import {
  createBoardRegion
} from "../board/board-region.js";

import {
  BoardCardDetector
} from "../board/board-card-detector.js";

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
  findSymbolBounds
} from "./symbol-bounds.js";

import {
  normalizeSymbolMask
} from "./normalize-symbol-mask.js";

import {
  symbolSimilarity
} from "./symbol-similarity.js";

import {
  SuitRecognizer
} from "./suit-recognizer.js";

async function extractSuitMasksAt(
  videoPath: string,
  timestampSeconds: number
): Promise<SymbolMask[]> {
  const frames =
    await extractFrames(
      videoPath,
      {
        startSeconds:
        timestampSeconds,
        endSeconds:
          timestampSeconds + 1,
        fps: 1
      }
    );

  const frame =
    frames[0];

  if (!frame) {
    throw new Error(
      `Expected frame at ${timestampSeconds}s`
    );
  }

  const decoder =
    new SharpImageDecoder();

  const tableDetector =
    new PurpleTableDetector(
      decoder
    );

  const tableDetection =
    await tableDetector.detect(
      frame
    );

  if (
    !tableDetection.region
  ) {
    throw new Error(
      `Expected table region at ${timestampSeconds}s`
    );
  }

  const boardRegion =
    createBoardRegion(
      tableDetection.region
    );

  const boardFrame =
    await cropFrame(
      frame,
      boardRegion,
      decoder
    );

  const boardCardDetector =
    new BoardCardDetector();

  const detection =
    boardCardDetector.detect(
      boardFrame
    );

  const masks:
    SymbolMask[] = [];

  for (
    const cardRegion
    of detection.regions
    ) {
    const cornerRegion =
      createCardCornerRegion(
        cardRegion
      );

    const symbolRegions =
      createCardSymbolRegions(
        cornerRegion
      );

    const frameSuitRegion = {
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

    const suitFrame =
      await cropFrame(
        frame,
        frameSuitRegion,
        decoder
      );

    const mask =
      createSymbolMask(
        suitFrame
      );

    const bounds =
      findSymbolBounds(
        mask
      );

    if (!bounds) {
      throw new Error(
        `Expected suit symbol at ${timestampSeconds}s`
      );
    }

    masks.push(
      normalizeSymbolMask(
        mask
      )
    );
  }

  return masks;
}

describe(
  "Suit recognition on real video",
  () => {
    it(
      "separates and recognizes real heart and club symbols",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const flopMasks =
          await extractSuitMasksAt(
            videoPath,
            11
          );

        const turnMasks =
          await extractSuitMasksAt(
            videoPath,
            21
          );

        expect(
          flopMasks
        ).toHaveLength(3);

        expect(
          turnMasks
        ).toHaveLength(4);

        const heart0 =
          flopMasks[0];

        const heart1 =
          flopMasks[1];

        const heart2 =
          flopMasks[2];

        const club =
          turnMasks[3];

        if (
          !heart0 ||
          !heart1 ||
          !heart2 ||
          !club
        ) {
          throw new Error(
            "Expected three hearts and one club"
          );
        }

        const sameSuit = {
          "heart0-heart1":
            symbolSimilarity(
              heart0,
              heart1
            ),

          "heart0-heart2":
            symbolSimilarity(
              heart0,
              heart2
            ),

          "heart1-heart2":
            symbolSimilarity(
              heart1,
              heart2
            )
        };

        const crossSuit = {
          "heart0-club":
            symbolSimilarity(
              heart0,
              club
            ),

          "heart1-club":
            symbolSimilarity(
              heart1,
              club
            ),

          "heart2-club":
            symbolSimilarity(
              heart2,
              club
            )
        };

        console.log({
          sameSuit,
          crossSuit
        });

        const sameSuitValues =
          Object.values(
            sameSuit
          );

        const crossSuitValues =
          Object.values(
            crossSuit
          );

        const minimumSameSuit =
          Math.min(
            ...sameSuitValues
          );

        const maximumCrossSuit =
          Math.max(
            ...crossSuitValues
          );

        console.log({
          minimumSameSuit,
          maximumCrossSuit,
          separation:
            minimumSameSuit -
            maximumCrossSuit
        });

        expect(
          minimumSameSuit
        ).toBeGreaterThan(
          maximumCrossSuit
        );

        const recognizer =
          new SuitRecognizer(
            [
              {
                suit:
                  "hearts",
                mask:
                heart0
              },
              {
                suit:
                  "clubs",
                mask:
                club
              }
            ],
            {
              minimumConfidence:
                0.8
            }
          );

        const heart1Recognition =
          recognizer.recognize(
            heart1
          );

        const heart2Recognition =
          recognizer.recognize(
            heart2
          );

        console.log({
          recognitions: {
            heart1:
            heart1Recognition,
            heart2:
            heart2Recognition
          }
        });

        expect(
          heart1Recognition.suit
        ).toBe(
          "hearts"
        );

        expect(
          heart2Recognition.suit
        ).toBe(
          "hearts"
        );

        expect(
          heart1Recognition.confidence
        ).toBeGreaterThan(
          0.9
        );

        expect(
          heart2Recognition.confidence
        ).toBeGreaterThan(
          0.9
        );
      }
    );
  }
);