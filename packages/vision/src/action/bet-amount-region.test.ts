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
      "insets the standard seat amount region",
      () => {
        const [
          region
        ] =
          createBetAmountRegions([
            {
              seatIndex: 2,
              x: 100,
              y: 200,
              width: 180,
              height: 56
            }
          ]);

        expect(
          region
        ).toEqual({
          seatIndex: 2,
          x: 127,
          y: 206,
          width: 126,
          height: 44
        });
      }
    );

    it(
      "extends seat 1 amount region upward",
      () => {
        const [
          region
        ] =
          createBetAmountRegions([
            {
              seatIndex: 1,
              x: 400,
              y: 300,
              width: 180,
              height: 56
            }
          ]);

        expect(
          region
        ).toEqual({
          seatIndex: 1,
          x: 427,
          y: 272,
          width: 126,
          height: 84
        });
      }
    );

    it(
      "extends seat 5 amount region upward",
      () => {
        const [
          region
        ] =
          createBetAmountRegions([
            {
              seatIndex: 5,
              x: 400,
              y: 300,
              width: 180,
              height: 56
            }
          ]);

        expect(
          region
        ).toEqual({
          seatIndex: 5,
          x: 427,
          y: 272,
          width: 126,
          height: 84
        });
      }
    );

    it(
      "does not extend other seats upward",
      () => {
        const regions =
          createBetAmountRegions([
            {
              seatIndex: 2,
              x: 100,
              y: 200,
              width: 180,
              height: 56
            },
            {
              seatIndex: 4,
              x: 400,
              y: 300,
              width: 180,
              height: 56
            }
          ]);

        expect(
          regions
        ).toEqual([
          {
            seatIndex: 2,
            x: 127,
            y: 206,
            width: 126,
            height: 44
          },
          {
            seatIndex: 4,
            x: 427,
            y: 306,
            width: 126,
            height: 44
          }
        ]);
      }
    );
  }
);