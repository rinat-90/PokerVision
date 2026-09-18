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
      "keeps amount regions inside the player action region",
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

        expect(
          region
        ).toBeDefined();

        if (!region) {
          throw new Error(
            "Expected region"
          );
        }

        expect(
          region.width
        ).toBe(126);

        expect(
          region.height
        ).toBe(44);

        expect(
          region.x
        ).toBe(127);

        expect(
          region.y
        ).toBe(206);
      }
    );
  }
);