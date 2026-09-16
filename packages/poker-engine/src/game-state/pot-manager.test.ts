import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculatePots,
  type Player
} from "./index.js";

function createPlayers(): Player[] {
  return [
    {
      id: "a",
      name: "Player A",
      position: "UTG",
      stack: 0,
      status: "all_in"
    },
    {
      id: "b",
      name: "Player B",
      position: "BTN",
      stack: 0,
      status: "all_in"
    },
    {
      id: "c",
      name: "Player C",
      position: "BB",
      stack: 0,
      status: "all_in"
    }
  ];
}

describe("pot manager", () => {
  it("creates a single pot when everyone contributes equally", () => {
    const players =
      createPlayers();

    const result =
      calculatePots(
        players,
        {
          a: 100,
          b: 100,
          c: 100
        }
      );

    expect(
      result.pots
    ).toEqual([
      {
        amount: 300,
        eligiblePlayerIds: [
          "a",
          "b",
          "c"
        ]
      }
    ]);
  });

  it("creates a main pot and side pot", () => {
    const players =
      createPlayers();

    const result =
      calculatePots(
        players,
        {
          a: 50,
          b: 150,
          c: 300
        }
      );

    expect(
      result.pots
    ).toEqual([
      {
        amount: 150,
        eligiblePlayerIds: [
          "a",
          "b",
          "c"
        ]
      },
      {
        amount: 200,
        eligiblePlayerIds: [
          "b",
          "c"
        ]
      },
      {
        amount: 150,
        eligiblePlayerIds: [
          "c"
        ]
      }
    ]);
  });

  it("does not allow folded players to win a pot", () => {
    const players =
      createPlayers();

    const foldedPlayers =
      players.map(
        (player) =>
          player.id === "a"
            ? {
              ...player,
              status: "folded" as const
            }
            : player
      );

    const result =
      calculatePots(
        foldedPlayers,
        {
          a: 50,
          b: 150,
          c: 300
        }
      );

    expect(
      result.pots[0]
        ?.eligiblePlayerIds
    ).toEqual([
      "b",
      "c"
    ]);

    expect(
      result.pots[1]
        ?.eligiblePlayerIds
    ).toEqual([
      "b",
      "c"
    ]);

    expect(
      result.pots[2]
        ?.eligiblePlayerIds
    ).toEqual([
      "c"
    ]);
  });

  it("handles two players with different stacks", () => {
    const players =
      createPlayers().slice(0, 2);

    const result =
      calculatePots(
        players,
        {
          a: 50,
          b: 150
        }
      );

    expect(
      result.pots
    ).toEqual([
      {
        amount: 100,
        eligiblePlayerIds: [
          "a",
          "b"
        ]
      },
      {
        amount: 100,
        eligiblePlayerIds: [
          "b"
        ]
      }
    ]);
  });

  it("ignores players with zero contribution", () => {
    const players =
      createPlayers();

    const result =
      calculatePots(
        players,
        {
          a: 0,
          b: 100,
          c: 100
        }
      );

    expect(
      result.pots
    ).toEqual([
      {
        amount: 200,
        eligiblePlayerIds: [
          "b",
          "c"
        ]
      }
    ]);
  });

  it("handles folded players contributing to the pot", () => {
    const players =
      createPlayers().map(
        (player) =>
          player.id === "a"
            ? {
              ...player,
              status: "folded" as const
            }
            : player
      );

    const result =
      calculatePots(
        players,
        {
          a: 100,
          b: 100,
          c: 100
        }
      );

    expect(
      result.pots[0]?.amount
    ).toBe(300);

    expect(
      result.pots[0]
        ?.eligiblePlayerIds
    ).toEqual([
      "b",
      "c"
    ]);
  });
});