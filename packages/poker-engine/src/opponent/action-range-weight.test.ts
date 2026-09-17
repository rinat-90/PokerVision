import {
  describe,
  expect,
  it
} from "vitest";

import {
  createActionRangeWeightModel
} from "./action-range-weight.js";

describe(
  "createActionRangeWeightModel",
  () => {
    it(
      "uses neutral multipliers by default",
      () => {
        const model =
          createActionRangeWeightModel();

        expect(
          model.getMultiplier({
            action: "call",
            street: "preflop"
          })
        ).toBe(1);

        expect(
          model.getMultiplier({
            action: "bet",
            street: "flop"
          })
        ).toBe(1);

        expect(
          model.getMultiplier({
            action: "raise",
            street: "turn"
          })
        ).toBe(1);
      }
    );

    it(
      "allows action-specific multipliers",
      () => {
        const model =
          createActionRangeWeightModel({
            multipliers: {
              call: 0.8,
              bet: 1.2,
              raise: 1.5
            }
          });

        expect(
          model.getMultiplier({
            action: "call",
            street: "flop"
          })
        ).toBe(0.8);

        expect(
          model.getMultiplier({
            action: "bet",
            street: "turn"
          })
        ).toBe(1.2);

        expect(
          model.getMultiplier({
            action: "raise",
            street: "river"
          })
        ).toBe(1.5);
      }
    );

    it(
      "returns zero for fold by default",
      () => {
        const model =
          createActionRangeWeightModel();

        expect(
          model.getMultiplier({
            action: "fold",
            street: "flop"
          })
        ).toBe(0);
      }
    );

    it(
      "rejects negative multipliers",
      () => {
        expect(() =>
          createActionRangeWeightModel({
            multipliers: {
              call: -0.5
            }
          })
        ).toThrow(
          "Range weight multiplier for call must be a finite number greater than or equal to 0"
        );
      }
    );

    it(
      "rejects non-finite multipliers",
      () => {
        expect(() =>
          createActionRangeWeightModel({
            multipliers: {
              raise: Number.NaN
            }
          })
        ).toThrow(
          "Range weight multiplier for raise must be a finite number greater than or equal to 0"
        );
      }
    );
  }
);