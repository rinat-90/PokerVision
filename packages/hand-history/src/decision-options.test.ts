import {
  describe,
  expect,
  it
} from "vitest";

import {
  getDecisionOptions
} from "./decision-options.js";

import type {
  Player
} from "@poker-vision/poker-engine";

function createPlayer(
  stack = 100
): Player {
  return {
    id: "hero",
    name: "Hero",
    position: "BTN",
    stack,
    status: "active"
  };
}

describe("getDecisionOptions", () => {
  it("allows check when there is no bet", () => {
    const result =
      getDecisionOptions(
        createPlayer(),
        0,
        0,
        2
      );

    expect(result).toEqual({
      canFold: false,
      canCheck: true,
      canCall: false,
      callAmount: 0,
      canBet: true,
      minimumBet: 2,
      canRaise: false,
      minimumRaise: 2
    });
  });

  it("allows call when facing a bet", () => {
    const result =
      getDecisionOptions(
        createPlayer(),
        20,
        0,
        10
      );

    expect(result.canFold).toBe(true);
    expect(result.canCheck).toBe(false);
    expect(result.canCall).toBe(true);
    expect(result.callAmount).toBe(20);

    expect(result.canBet).toBe(false);
    expect(result.canRaise).toBe(true);
    expect(result.minimumRaise).toBe(30);
  });

  it("calculates call amount after partial contribution", () => {
    const result =
      getDecisionOptions(
        createPlayer(),
        20,
        8,
        10
      );

    expect(result.callAmount).toBe(12);
    expect(result.canCall).toBe(true);
    expect(result.canCheck).toBe(false);
  });

  it("does not allow call when player has no stack", () => {
    const result =
      getDecisionOptions(
        createPlayer(0),
        20,
        0,
        10
      );

    expect(result.canFold).toBe(true);
    expect(result.canCall).toBe(false);
    expect(result.callAmount).toBe(20);
    expect(result.canRaise).toBe(false);
  });

  it("does not allow betting when a bet already exists", () => {
    const result =
      getDecisionOptions(
        createPlayer(),
        20,
        0,
        10
      );

    expect(result.canBet).toBe(false);
    expect(result.minimumBet).toBe(0);
  });

  it("does not allow raising when stack is too small", () => {
    const result =
      getDecisionOptions(
        createPlayer(25),
        20,
        0,
        10
      );

    expect(result.canCall).toBe(true);
    expect(result.callAmount).toBe(20);

    expect(result.canRaise).toBe(false);
  });
});