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
  RankRecognizer
} from "./rank-recognizer.js";

async function extractRankMasksAt(
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

    const frameRankRegion = {
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

    const rankFrame =
      await cropFrame(
        frame,
        frameRankRegion,
        decoder
      );

    const mask =
      createSymbolMask(
        rankFrame
      );

    const bounds =
      findSymbolBounds(
        mask
      );

    if (!bounds) {
      throw new Error(
        `Expected rank symbol at ${timestampSeconds}s`
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
  "Rank recognition on real video",
  () => {
    it(
      "separates and recognizes real rank symbols",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const flopMasks =
          await extractRankMasksAt(
            videoPath,
            11
          );

        const turnMasks =
          await extractRankMasksAt(
            videoPath,
            21
          );

        expect(
          flopMasks
        ).toHaveLength(3);

        expect(
          turnMasks
        ).toHaveLength(4);

        const rank2 =
          flopMasks[0];

        const rank6 =
          flopMasks[1];

        const rank5Flop =
          flopMasks[2];

        const rank5Turn =
          turnMasks[3];

        if (
          !rank2 ||
          !rank6 ||
          !rank5Flop ||
          !rank5Turn
        ) {
          throw new Error(
            "Expected ranks 2, 6, 5 and 5"
          );
        }

        const sameRank =
          symbolSimilarity(
            rank5Flop,
            rank5Turn
          );

        const differentRanks = {
          "2-6":
            symbolSimilarity(
              rank2,
              rank6
            ),

          "2-5":
            symbolSimilarity(
              rank2,
              rank5Flop
            ),

          "6-5":
            symbolSimilarity(
              rank6,
              rank5Flop
            )
        };

        const maximumDifferentRank =
          Math.max(
            ...Object.values(
              differentRanks
            )
          );

        console.log({
          sameRank,
          differentRanks
        });

        console.log({
          sameRank,
          maximumDifferentRank,
          separation:
            sameRank -
            maximumDifferentRank
        });

        expect(
          sameRank
        ).toBeGreaterThan(
          maximumDifferentRank
        );

        const recognizer =
          new RankRecognizer(
            [
              {
                rank: "2",
                mask: rank2
              },
              {
                rank: "6",
                mask: rank6
              },
              {
                rank: "5",
                mask: rank5Flop
              }
            ],
            {
              minimumConfidence:
                0.9
            }
          );

        const recognition =
          recognizer.recognize(
            rank5Turn
          );

        console.log({
          recognition
        });

        expect(
          recognition.rank
        ).toBe(
          "5"
        );

        expect(
          recognition.confidence
        ).toBeGreaterThan(
          0.9
        );
      }
    );
  }
);