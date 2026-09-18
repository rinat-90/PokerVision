import {
  describe,
  expect,
  it
} from "vitest";

import {
  createBetAmountRegions
} from "./bet-amount-region.js";

describe(
  "createBetAmountRegions",
  () => {
    it(
      "creates one amount region per seat",
      () => {
        const regions =
          createBetAmountRegions([
            {
              seatIndex: 0,
              x: 100,
              y: 200,
              width: 180,
              height: 56
            },
            {
              seatIndex: 1,
              x: 400,
              y: 300,
              width: 180,
              height: 56
            }
          ]);

        expect(
          regions
        ).toHaveLength(2);

        expect(
          regions.map(
            (region) =>
              region.seatIndex
          )
        ).toEqual([
          0,
          1
        ]);
      }
    );

    it(
      "keeps amount regions inside the expected horizontal area",
      () => {
        const [
          region
        ] =
          createBetAmountRegions([
            {
              seatIndex: 0,
              x: 100,
              y: 200,
              width: 180,
              height: 56
            }
          ]);

        expect(region).toBeDefined();

        if (!region) {
          throw new Error(
            "Expected region"
          );
        }

        expect(
          region.width
        ).toBe(234);

        expect(
          region.height
        ).toBe(50);

        expect(
          region.x
        ).toBe(73);

        expect(
          region.y
        ).toBe(245);
      }
    );
  }
);