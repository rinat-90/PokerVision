import { describe, expect, it } from "vitest";

import { distributePot } from "./distribute-pot.js";

describe("distributePot", () => {
  it("splits an even pot equally", () => {
    const payouts = {
      hero: 0,
      villain: 0
    };

    distributePot(
      payouts,
      200,
      ["hero", "villain"]
    );

    expect(payouts).toEqual({
      hero: 100,
      villain: 100
    });
  });

  it("gives the odd chip to the first winner", () => {
    const payouts = {
      hero: 0,
      villain: 0
    };

    distributePot(
      payouts,
      201,
      ["hero", "villain"]
    );

    expect(payouts).toEqual({
      hero: 101,
      villain: 100
    });
  });

  it("supports more than two winners", () => {
    const payouts = {
      hero: 0,
      villain: 0,
      fish: 0
    };

    distributePot(
      payouts,
      202,
      ["hero", "villain", "fish"]
    );

    expect(payouts).toEqual({
      hero: 68,
      villain: 67,
      fish: 67
    });
  });

  it("throws when there are no winners", () => {
    expect(() => {
      distributePot(
        {},
        100,
        []
      );
    }).toThrow(
      "Cannot distribute pot without winners"
    );
  });
});