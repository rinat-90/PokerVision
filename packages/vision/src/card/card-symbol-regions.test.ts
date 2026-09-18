import {
  describe,
  expect,
  it
} from "vitest";

import {
  createCardSymbolRegions
} from "./card-symbol-regions.js";

describe(
  "createCardSymbolRegions",
  () => {
    it(
      "creates centered rank and suit regions",
      () => {
        expect(
          createCardSymbolRegions({
            x: 100,
            y: 50,
            width: 42,
            height: 79
          })
        ).toEqual({
          rank: {
            x: 107,
            y: 50,
            width: 29,
            height: 32
          },
          suit: {
            x: 107,
            y: 82,
            width: 29,
            height: 32
          }
        });
      }
    );

    it(
      "keeps rank at the top and horizontally inset",
      () => {
        const corner = {
          x: 120,
          y: 16,
          width: 42,
          height: 79
        };

        const regions =
          createCardSymbolRegions(
            corner
          );

        expect(
          regions.rank.y
        ).toBe(
          corner.y
        );

        expect(
          regions.rank.x
        ).toBeGreaterThan(
          corner.x
        );

        expect(
          regions.rank.x
        ).toBe(127);

        expect(
          regions.rank.width
        ).toBe(29);
      }
    );

    it(
      "places suit below rank",
      () => {
        const regions =
          createCardSymbolRegions({
            x: 0,
            y: 0,
            width: 42,
            height: 79
          });

        expect(
          regions.suit.y
        ).toBeGreaterThan(
          regions.rank.y
        );

        expect(
          regions.suit.y
        ).toBe(
          regions.rank.y +
          regions.rank.height
        );
      }
    );

    it(
      "centers symbol regions horizontally",
      () => {
        const corner = {
          x: 20,
          y: 30,
          width: 42,
          height: 79
        };

        const regions =
          createCardSymbolRegions(
            corner
          );

        expect(
          regions.rank.x
        ).toBe(27);

        expect(
          regions.suit.x
        ).toBe(27);

        expect(
          regions.rank.width
        ).toBe(29);

        expect(
          regions.suit.width
        ).toBe(29);
      }
    );

    it(
      "keeps symbol regions inside the corner",
      () => {
        const corner = {
          x: 20,
          y: 30,
          width: 42,
          height: 79
        };

        const regions =
          createCardSymbolRegions(
            corner
          );

        expect(
          regions.rank.x
        ).toBeGreaterThanOrEqual(
          corner.x
        );

        expect(
          regions.rank.x +
          regions.rank.width
        ).toBeLessThanOrEqual(
          corner.x +
          corner.width
        );

        expect(
          regions.suit.y +
          regions.suit.height
        ).toBeLessThanOrEqual(
          corner.y +
          corner.height
        );
      }
    );
  }
);