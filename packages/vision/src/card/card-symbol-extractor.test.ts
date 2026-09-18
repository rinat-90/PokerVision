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
  CardSymbolExtractor
} from "./card-symbol-extractor.js";

class FakeImageDecoder
  implements ImageDecoder {
  async decode(
    _data: Uint8Array
  ) {
    const width = 200;
    const height = 200;
    const channels = 3;

    const data =
      new Uint8Array(
        width *
        height *
        channels
      );

    data.fill(255);

    return {
      data,
      width,
      height,
      channels
    };
  }
}

describe(
  "CardSymbolExtractor",
  () => {
    it(
      "extracts normalized rank and suit masks",
      async () => {
        const frame = {
          data:
            new Uint8Array([
              1
            ])
        } as VideoFrame;

        const extractor =
          new CardSymbolExtractor(
            new FakeImageDecoder()
          );

        const symbols =
          await extractor.extract(
            frame,
            {
              x: 20,
              y: 30,
              width: 150,
              height: 100
            },
            {
              x: 40,
              y: 10,
              width: 100,
              height: 140
            }
          );

        expect(
          symbols.rank.width
        ).toBe(24);

        expect(
          symbols.rank.height
        ).toBe(24);

        expect(
          symbols.suit.width
        ).toBe(24);

        expect(
          symbols.suit.height
        ).toBe(24);

        expect(
          symbols.rank.data
        ).toHaveLength(
          24 * 24
        );

        expect(
          symbols.suit.data
        ).toHaveLength(
          24 * 24
        );
      }
    );

    it(
      "returns empty masks when symbol regions are white",
      async () => {
        const frame = {
          data:
            new Uint8Array([
              1
            ])
        } as VideoFrame;

        const extractor =
          new CardSymbolExtractor(
            new FakeImageDecoder()
          );

        const symbols =
          await extractor.extract(
            frame,
            {
              x: 0,
              y: 0,
              width: 200,
              height: 200
            },
            {
              x: 50,
              y: 20,
              width: 100,
              height: 140
            }
          );

        expect(
          Array.from(
            symbols.rank.data
          ).every(
            value =>
              value === 0
          )
        ).toBe(true);

        expect(
          Array.from(
            symbols.suit.data
          ).every(
            value =>
              value === 0
          )
        ).toBe(true);
      }
    );
  }
);