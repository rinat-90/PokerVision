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
  CardSymbolExtractor,
  type ExtractedCardSymbols
} from "./card-symbol-extractor.js";

import {
  RankRecognizer
} from "./rank-recognizer.js";

import {
  SuitRecognizer
} from "./suit-recognizer.js";

import {
  CardRecognizer
} from "./card-recognizer.js";

async function extractCardSymbolsAt(
  videoPath: string,
  timestampSeconds: number
): Promise<ExtractedCardSymbols[]> {
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

  const symbolExtractor =
    new CardSymbolExtractor(
      decoder
    );

  const symbols:
    ExtractedCardSymbols[] = [];

  for (
    const cardRegion
    of detection.regions
    ) {
    symbols.push(
      await symbolExtractor.extract(
        frame,
        boardRegion,
        cardRegion
      )
    );
  }

  return symbols;
}

describe(
  "Card recognition on real video",
  () => {
    it(
      "recognizes the real turn card as five of clubs",
      async () => {
        const videoPath =
          fileURLToPath(
            new URL(
              "../../../video/fixtures/real/poker-table.mp4",
              import.meta.url
            )
          );

        const flopSymbols =
          await extractCardSymbolsAt(
            videoPath,
            11
          );

        const turnSymbols =
          await extractCardSymbolsAt(
            videoPath,
            21
          );

        expect(
          flopSymbols
        ).toHaveLength(3);

        expect(
          turnSymbols
        ).toHaveLength(4);

        const rank2 =
          flopSymbols[0];

        const rank6 =
          flopSymbols[1];

        const rank5 =
          flopSymbols[2];

        const turn5Club =
          turnSymbols[3];

        if (
          !rank2 ||
          !rank6 ||
          !rank5 ||
          !turn5Club
        ) {
          throw new Error(
            "Expected flop and turn card symbols"
          );
        }

        const rankRecognizer =
          new RankRecognizer(
            [
              {
                rank: "2",
                mask:
                rank2.rank
              },
              {
                rank: "6",
                mask:
                rank6.rank
              },
              {
                rank: "5",
                mask:
                rank5.rank
              }
            ],
            {
              minimumConfidence:
                0.9
            }
          );

        const suitRecognizer =
          new SuitRecognizer(
            [
              {
                suit: "hearts",
                mask:
                rank2.suit
              },
              {
                suit: "clubs",
                mask:
                turn5Club.suit
              }
            ],
            {
              minimumConfidence:
                0.8
            }
          );

        const cardRecognizer =
          new CardRecognizer(
            rankRecognizer,
            suitRecognizer
          );

        const recognition =
          cardRecognizer.recognize(
            turn5Club
          );

        console.log({
          recognition
        });

        expect(
          recognition.card
        ).not.toBeNull();

        expect(
          recognition.card?.rank
        ).toBe(
          "5"
        );

        expect(
          recognition.card?.suit
        ).toBe(
          "clubs"
        );

        expect(
          recognition.card
            ?.rankConfidence
        ).toBeGreaterThan(
          0.95
        );

        expect(
          recognition.card
            ?.suitConfidence
        ).toBe(
          1
        );

        expect(
          recognition.card
            ?.confidence
        ).toBeGreaterThan(
          0.95
        );
      }
    );
  }
);