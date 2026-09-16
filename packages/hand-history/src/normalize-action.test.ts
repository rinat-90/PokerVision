import {
  describe,
  expect,
  it
} from "vitest";

import type {
  HandHistoryAction
} from "./types.js";

import {
  normalizeActionAmount
} from "./normalize-action.js";

function createAction(
  overrides: Partial<HandHistoryAction> = {}
): HandHistoryAction {
  return {
    playerId: "hero",
    type: "call",
    amount: 4,
    amountType: "contribution",
    street: "preflop",
    ...overrides
  };
}

describe("normalizeActionAmount", () => {
  it("returns contribution amount directly", () => {
    const action = createAction({
      amount: 4,
      amountType: "contribution"
    });

    expect(
      normalizeActionAmount(action, 2)
    ).toBe(4);
  });

  it("converts total amount into contribution", () => {
    const action = createAction({
      amount: 6,
      amountType: "total"
    });

    expect(
      normalizeActionAmount(action, 2)
    ).toBe(4);
  });

  it("handles a total amount with no previous contribution", () => {
    const action = createAction({
      amount: 6,
      amountType: "total"
    });

    expect(
      normalizeActionAmount(action, 0)
    ).toBe(6);
  });

  it("returns zero when total amount equals previous contribution", () => {
    const action = createAction({
      amount: 6,
      amountType: "total"
    });

    expect(
      normalizeActionAmount(action, 6)
    ).toBe(0);
  });

  it("does not return a negative contribution", () => {
    const action = createAction({
      amount: 4,
      amountType: "total"
    });

    expect(
      normalizeActionAmount(action, 6)
    ).toBe(0);
  });

  it("rejects negative previous contribution", () => {
    const action = createAction();

    expect(() =>
      normalizeActionAmount(action, -1)
    ).toThrow(
      "Previous contribution cannot be negative"
    );
  });

  it("rejects negative action amount", () => {
    const action = createAction({
      amount: -1
    });

    expect(() =>
      normalizeActionAmount(action, 0)
    ).toThrow(
      "Action amount cannot be negative"
    );
  });
});