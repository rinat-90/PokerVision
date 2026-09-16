import {
  describe,
  expect,
  it
} from "vitest";

import {
  derivePlayerStatus
} from "./player-status.js";

import type {
  HandHistoryAction
} from "./types.js";

const createAction = (
  overrides: Partial<HandHistoryAction> = {}
): HandHistoryAction => ({
  playerId: "hero",
  type: "check",
  amount: 0,
  amountType: "contribution",
  street: "flop",
  ...overrides
});

describe("derivePlayerStatus", () => {
  it("keeps a player active when they have not folded or gone all-in", () => {
    const actions = [
      createAction({
        type: "call",
        amount: 10
      })
    ];

    expect(
      derivePlayerStatus(
        "hero",
        actions
      )
    ).toBe("active");
  });

  it("marks a player as folded after a fold", () => {
    const actions = [
      createAction({
        type: "call",
        amount: 10
      }),
      createAction({
        type: "fold"
      })
    ];

    expect(
      derivePlayerStatus(
        "hero",
        actions
      )
    ).toBe("folded");
  });

  it("marks a player as all-in after an all-in action", () => {
    const actions = [
      createAction({
        type: "all_in",
        amount: 100
      })
    ];

    expect(
      derivePlayerStatus(
        "hero",
        actions
      )
    ).toBe("all_in");
  });

  it("ignores actions belonging to other players", () => {
    const actions = [
      createAction({
        playerId: "villain",
        type: "fold"
      })
    ];

    expect(
      derivePlayerStatus(
        "hero",
        actions
      )
    ).toBe("active");
  });
});