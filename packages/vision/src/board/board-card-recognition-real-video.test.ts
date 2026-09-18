import {
  describe,
  expect,
  it
} from "vitest";

import {
  fileURLToPath
} from "node:url";

import {
  extractFrames,
  type VideoFrame
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
} from "./board-region.js";

import {
  BoardCardDetector
} from "./board-card-detector.js";

import {
  CardSymbolExtractor,
  type ExtractedCardSymbols
} from "../card/card-symbol-extractor.js";

import {
  RankRecognizer
} from "../card/rank-recognizer.js";

import {
  SuitRecognizer
} from "../card/suit-recognizer.js";

import {
  CardRecognizer
} from "../card/card-recognizer.js";

import {
  BoardCardRecognizer
} from "./board-card-recognizer.js";

async function extractFrameAt(
  videoPath: string,
  timestampSeconds: number
): Promise<VideoFrame> {
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

  return frame;
}

async function extractBoardSymbols(
  frame: VideoFrame,
  expectedCardCount: number,
  decoder: SharpImageDecoder
): Promise<ExtractedCardSymbols[]> {
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
      "Expected table region"
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

  expect(
    detection.regions
  ).toHaveLength(
    expectedCardCount
  );

  const symbolExtractor =
    new CardSymbolExtractor(
      decoder
    );

  return Promise.all(
    detection.regions.map(
      (region) =>
        symbolExtractor.extract(
          frame,
          boardRegion,
          region
        )
    )
  );
}

async function recognizeBoard(
  frame: VideoFrame,
  decoder: SharpImageDecoder,
  cardRecognizer: CardRecognizer
) {
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
      "Expected target table region"
    );
  }

  const boardRegion =
    createBoardRegion(
      tableDetection.region
    );

  const boardRecognizer =
    new BoardCardRecognizer(
      decoder,
      cardRecognizer
    );

  const result =
    await boardRecognizer.recognize(
      frame,
      boardRegion
    );

  return result.cards.map(
    ({ recognition }) =>
      recognition
  );
}

describe(
  "Board card recognition on real video",
  () => {
    const videoPath =
      fileURLToPath(
        new URL(
          "../../../video/fixtures/real/poker-table.mp4",
          import.meta.url
        )
      );

    it(
      "recognizes the flop on a different frame",
      async () => {
        const templateFrame =
          await extractFrameAt(
            videoPath,
            11
          );

        const targetFrame =
          await extractFrameAt(
            videoPath,
            12
          );

        const decoder =
          new SharpImageDecoder();

        const templateSymbols =
          await extractBoardSymbols(
            templateFrame,
            3,
            decoder
          );

        const rank2 =
          templateSymbols[0];

        const rank6 =
          templateSymbols[1];

        const rank5 =
          templateSymbols[2];

        if (
          !rank2 ||
          !rank6 ||
          !rank5
        ) {
          throw new Error(
            "Expected 2, 6 and 5 templates"
          );
        }

        const rankRecognizer =
          new RankRecognizer(
            [
              {
                rank: "2",
                mask: rank2.rank
              },
              {
                rank: "6",
                mask: rank6.rank
              },
              {
                rank: "5",
                mask: rank5.rank
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
                mask: rank2.suit
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

        const recognitions =
          await recognizeBoard(
            targetFrame,
            decoder,
            cardRecognizer
          );

        const cards =
          recognitions.map(
            (recognition) =>
              recognition.card
          );

        expect(
          cards
        ).toHaveLength(3);

        expect(
          cards.map(
            (card) => ({
              rank:
              card?.rank,
              suit:
              card?.suit
            })
          )
        ).toEqual([
          {
            rank: "2",
            suit: "hearts"
          },
          {
            rank: "6",
            suit: "hearts"
          },
          {
            rank: "5",
            suit: "hearts"
          }
        ]);
      }
    );

    it(
      "recognizes the turn board on a different frame",
      async () => {
        const flopTemplateFrame =
          await extractFrameAt(
            videoPath,
            11
          );

        const turnTemplateFrame =
          await extractFrameAt(
            videoPath,
            21
          );

        const targetFrame =
          await extractFrameAt(
            videoPath,
            22
          );

        const decoder =
          new SharpImageDecoder();

        const flopSymbols =
          await extractBoardSymbols(
            flopTemplateFrame,
            3,
            decoder
          );

        const turnSymbols =
          await extractBoardSymbols(
            turnTemplateFrame,
            4,
            decoder
          );

        const rank2 =
          flopSymbols[0];

        const rank6 =
          flopSymbols[1];

        const rank5 =
          flopSymbols[2];

        const club5 =
          turnSymbols[3];

        if (
          !rank2 ||
          !rank6 ||
          !rank5 ||
          !club5
        ) {
          throw new Error(
            "Expected rank and suit templates"
          );
        }

        const rankRecognizer =
          new RankRecognizer(
            [
              {
                rank: "2",
                mask: rank2.rank
              },
              {
                rank: "6",
                mask: rank6.rank
              },
              {
                rank: "5",
                mask: rank5.rank
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
                mask: rank2.suit
              },
              {
                suit: "clubs",
                mask: club5.suit
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

        const recognitions =
          await recognizeBoard(
            targetFrame,
            decoder,
            cardRecognizer
          );

        const cards =
          recognitions.map(
            (recognition) =>
              recognition.card
          );

        expect(
          cards
        ).toHaveLength(4);

        expect(
          cards.map(
            (card) => ({
              rank:
              card?.rank,
              suit:
              card?.suit
            })
          )
        ).toEqual([
          {
            rank: "2",
            suit: "hearts"
          },
          {
            rank: "6",
            suit: "hearts"
          },
          {
            rank: "5",
            suit: "hearts"
          },
          {
            rank: "5",
            suit: "clubs"
          }
        ]);
      }
    );
  }
);