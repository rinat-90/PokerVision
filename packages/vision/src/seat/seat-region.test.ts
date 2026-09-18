import {
  describe,
  expect,
  it
} from "vitest";

import {
  createSixMaxSeatRegions
} from "./seat-region.js";

describe(
  "createSixMaxSeatRegions",
  () => {
    it(
      "creates six bounded seat regions",
      () => {
        const regions =
          createSixMaxSeatRegions(
            {
              x: 100,
              y: 200,
              width: 1000,
              height: 400
            },
            {
              width: 1200,
              height: 800
            }
          );

        expect(regions)
          .toHaveLength(6);

        expect(
          regions.map(
            (region) =>
              region.index
          )
        ).toEqual([
          0,
          1,
          2,
          3,
          4,
          5
        ]);

        for (
          const region
          of regions
          ) {
          expect(region.x)
            .toBeGreaterThanOrEqual(
              0
            );

          expect(region.y)
            .toBeGreaterThanOrEqual(
              0
            );

          expect(
            region.x +
            region.width
          ).toBeLessThanOrEqual(
            1200
          );

          expect(
            region.y +
            region.height
          ).toBeLessThanOrEqual(
            800
          );

          expect(region.width)
            .toBeGreaterThan(0);

          expect(region.height)
            .toBeGreaterThan(0);
        }
      }
    );

    it(
      "clamps edge seats to frame bounds",
      () => {
        const regions =
          createSixMaxSeatRegions(
            {
              x: 0,
              y: 0,
              width: 1000,
              height: 400
            },
            {
              width: 1000,
              height: 500
            }
          );

        for (
          const region
          of regions
          ) {
          expect(region.x)
            .toBeGreaterThanOrEqual(
              0
            );

          expect(region.y)
            .toBeGreaterThanOrEqual(
              0
            );

          expect(
            region.x +
            region.width
          ).toBeLessThanOrEqual(
            1000
          );

          expect(
            region.y +
            region.height
          ).toBeLessThanOrEqual(
            500
          );
        }
      }
    );
  }
);