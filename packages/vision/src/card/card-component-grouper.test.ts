import {
  describe,
  expect,
  it
} from "vitest";

import {
  CardComponentGrouper
} from "./card-component-grouper.js";

describe(
  "CardComponentGrouper",
  () => {
    it(
      "groups nearby components",
      () => {
        const grouper =
          new CardComponentGrouper({
            maxHorizontalGap: 10,
            maxVerticalGap: 10
          });

        const result =
          grouper.group([
            {
              x: 50,
              y: 40,
              width: 20,
              height: 30,
              pixelCount: 300
            },
            {
              x: 72,
              y: 40,
              width: 20,
              height: 30,
              pixelCount: 300
            }
          ]);

        expect(result)
          .toEqual([
            {
              x: 50,
              y: 40,
              width: 42,
              height: 30
            }
          ]);
      }
    );

    it(
      "keeps distant components separate",
      () => {
        const grouper =
          new CardComponentGrouper({
            maxHorizontalGap: 10,
            maxVerticalGap: 10
          });

        const result =
          grouper.group([
            {
              x: 20,
              y: 20,
              width: 20,
              height: 30,
              pixelCount: 300
            },
            {
              x: 150,
              y: 100,
              width: 20,
              height: 30,
              pixelCount: 300
            }
          ]);

        expect(result)
          .toEqual([
            {
              x: 20,
              y: 20,
              width: 20,
              height: 30
            },
            {
              x: 150,
              y: 100,
              width: 20,
              height: 30
            }
          ]);
      }
    );

    it(
      "groups components transitively",
      () => {
        const grouper =
          new CardComponentGrouper({
            maxHorizontalGap: 10,
            maxVerticalGap: 10
          });

        const result =
          grouper.group([
            {
              x: 20,
              y: 20,
              width: 20,
              height: 30,
              pixelCount: 300
            },
            {
              x: 45,
              y: 20,
              width: 20,
              height: 30,
              pixelCount: 300
            },
            {
              x: 70,
              y: 20,
              width: 20,
              height: 30,
              pixelCount: 300
            }
          ]);

        expect(result)
          .toEqual([
            {
              x: 20,
              y: 20,
              width: 70,
              height: 30
            }
          ]);
      }
    );

    it(
      "does not grow a group beyond card size",
      () => {
        const grouper =
          new CardComponentGrouper({
            maxHorizontalGap: 10,
            maxVerticalGap: 10,
            maxWidth: 70,
            maxHeight: 100
          });

        const result =
          grouper.group([
            {
              x: 20,
              y: 20,
              width: 20,
              height: 30,
              pixelCount: 300
            },
            {
              x: 45,
              y: 20,
              width: 20,
              height: 30,
              pixelCount: 300
            },
            {
              x: 70,
              y: 20,
              width: 20,
              height: 30,
              pixelCount: 300
            },
            {
              x: 95,
              y: 20,
              width: 20,
              height: 30,
              pixelCount: 300
            }
          ]);

        expect(result)
          .toEqual([
            {
              x: 20,
              y: 20,
              width: 70,
              height: 30
            },
            {
              x: 95,
              y: 20,
              width: 20,
              height: 30
            }
          ]);
      }
    );

  }
);