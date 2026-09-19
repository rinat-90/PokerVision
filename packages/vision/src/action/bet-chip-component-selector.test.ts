import {
  describe,
  expect,
  it
} from "vitest";

import {
  BetChipComponentSelector
} from "./bet-chip-component-selector.js";

import type {
  BetChipComponent
} from "./bet-chip-detector.js";

function component(
  x: number,
  y: number,
  width: number,
  height: number,
  pixelCount: number
): BetChipComponent {
  return {
    pixelCount,

    region: {
      x,
      y,
      width,
      height
    }
  };
}

describe(
  "BetChipComponentSelector",
  () => {
    const selector =
      new BetChipComponentSelector();

    it(
      "returns null when there are no components",
      () => {
        expect(
          selector.select({
            components: [],
            seatIndex: 0,
            frameWidth: 180,
            frameHeight: 60
          })
        ).toBeNull();
      }
    );

    it(
      "ignores tiny blue noise",
      () => {
        expect(
          selector.select({
            components: [
              component(
                90,
                50,
                2,
                2,
                3
              )
            ],
            seatIndex: 0,
            frameWidth: 180,
            frameHeight: 60
          })
        ).toBeNull();
      }
    );

    it(
      "selects the inward component for the top-center seat",
      () => {
        const outward =
          component(
            85,
            2,
            20,
            10,
            200
          );

        const inward =
          component(
            82,
            42,
            12,
            10,
            60
          );

        const result =
          selector.select({
            components: [
              outward,
              inward
            ],
            seatIndex: 0,
            frameWidth: 180,
            frameHeight: 60
          });

        expect(
          result
        ).toEqual(
          inward
        );
      }
    );

    it(
      "selects the inward component for the bottom-center seat",
      () => {
        const inward =
          component(
            84,
            5,
            12,
            10,
            60
          );

        const outward =
          component(
            80,
            42,
            30,
            14,
            250
          );

        const result =
          selector.select({
            components: [
              outward,
              inward
            ],
            seatIndex: 3,
            frameWidth: 180,
            frameHeight: 60
          });

        expect(
          result
        ).toEqual(
          inward
        );
      }
    );

    it(
      "selects the inward component for the top-right seat",
      () => {
        const outward =
          component(
            145,
            5,
            25,
            20,
            300
          );

        const inward =
          component(
            12,
            40,
            15,
            10,
            50
          );

        const result =
          selector.select({
            components: [
              outward,
              inward
            ],
            seatIndex: 1,
            frameWidth: 180,
            frameHeight: 60
          });

        expect(
          result
        ).toEqual(
          inward
        );
      }
    );

    it(
      "selects the inward component for the bottom-left seat",
      () => {
        const outward =
          component(
            5,
            42,
            30,
            14,
            250
          );

        const inward =
          component(
            150,
            5,
            15,
            10,
            50
          );

        const result =
          selector.select({
            components: [
              outward,
              inward
            ],
            seatIndex: 4,
            frameWidth: 180,
            frameHeight: 60
          });

        expect(
          result
        ).toEqual(
          inward
        );
      }
    );
  }
);