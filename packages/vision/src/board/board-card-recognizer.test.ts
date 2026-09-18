import {
  describe,
  expect,
  it
} from "vitest";

import type {
  VideoFrame
} from "@poker-vision/video";

import type {
  ImageDecoder
} from "../image/image-decoder.js";

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
  CardSymbolExtractor
} from "../card/card-symbol-extractor.js";

import {
  BoardCardRecognizer
} from "./board-card-recognizer.js";

class FakeImageDecoder
  implements ImageDecoder {
  constructor(
    private readonly data:
    Uint8Array,
    private readonly width:
    number,
    private readonly height:
    number
  ) {}

  async decode(
    _data: Uint8Array
  ) {
    return {
      data:
      this.data,
      width:
      this.width,
      height:
      this.height,
      channels: 3
    };
  }
}

function fillRect(
  data: Uint8Array,
  imageWidth: number,
  x: number,
  y: number,
  width: number,
  height: number,
  value: number
): void {
  for (
    let row = y;
    row < y + height;
    row += 1
  ) {
    for (
      let column = x;
      column < x + width;
      column += 1
    ) {
      const offset =
        (
          row *
          imageWidth +
          column
        ) *
        3;

      data[offset] =
        value;

      data[offset + 1] =
        value;

      data[offset + 2] =
        value;
    }
  }
}

describe(
  "BoardCardRecognizer",
  () => {
    it(
      "detects and recognizes a board card",
      async () => {
        const width = 300;
        const height = 220;

        const data =
          new Uint8Array(
            width *
            height *
            3
          );

        /*
         * Board:
         *
         * card x=100..199
         *      y=40..179
         *
         * 100x140 satisfies the real
         * BoardCardDetector dimensions.
         */
        fillRect(
          data,
          width,
          100,
          40,
          100,
          140,
          255
        );

        const frame = {
          data:
            new Uint8Array([
              1
            ])
        } as VideoFrame;

        const decoder =
          new FakeImageDecoder(
            data,
            width,
            height
          );

        /*
         * Extract the clean white card first.
         * That gives us exactly the same
         * normalized empty masks that the
         * production extractor will produce.
         *
         * We use those as templates here
         * because this test is about board
         * orchestration, not symbol quality.
         */
        const symbolExtractor =
          new CardSymbolExtractor(
            decoder
          );

        const templates =
          await symbolExtractor.extract(
            frame,
            {
              x: 0,
              y: 0,
              width,
              height
            },
            {
              x: 100,
              y: 40,
              width: 100,
              height: 140
            }
          );

        const rankRecognizer =
          new RankRecognizer(
            [
              {
                rank: "5",
                mask:
                templates.rank
              }
            ]
          );

        const suitRecognizer =
          new SuitRecognizer(
            [
              {
                suit: "clubs",
                mask:
                templates.suit
              }
            ]
          );

        const cardRecognizer =
          new CardRecognizer(
            rankRecognizer,
            suitRecognizer
          );

        const recognizer =
          new BoardCardRecognizer(
            decoder,
            cardRecognizer
          );

        const result =
          await recognizer.recognize(
            frame,
            {
              x: 0,
              y: 0,
              width,
              height
            }
          );

        expect(
          result.cards
        ).toHaveLength(1);

        const card =
          result.cards[0];

        if (!card) {
          throw new Error(
            "Expected one recognized board card"
          );
        }

        expect(
          card.region
        ).toEqual({
          x: 100,
          y: 40,
          width: 100,
          height: 140
        });

        expect(
          card.recognition.card
        ).toEqual({
          rank: "5",
          suit: "clubs",
          rankConfidence: 1,
          suitConfidence: 1,
          confidence: 1
        });
      }
    );

    it(
      "returns no cards when the board is empty",
      async () => {
        const width = 300;
        const height = 220;

        const data =
          new Uint8Array(
            width *
            height *
            3
          );

        const frame = {
          data:
            new Uint8Array([
              1
            ])
        } as VideoFrame;

        const decoder =
          new FakeImageDecoder(
            data,
            width,
            height
          );

        const recognizer =
          new BoardCardRecognizer(
            decoder,
            new CardRecognizer(
              new RankRecognizer(
                []
              ),
              new SuitRecognizer(
                []
              )
            )
          );

        const result =
          await recognizer.recognize(
            frame,
            {
              x: 0,
              y: 0,
              width,
              height
            }
          );

        expect(
          result.cards
        ).toEqual([]);
      }
    );
  }
);