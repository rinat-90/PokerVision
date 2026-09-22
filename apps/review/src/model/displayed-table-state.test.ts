import {
  describe,
  expect,
  it
} from "vitest";

import type {
  HandReviewAction,
  HandReviewDecisionState
} from "@poker-vision/hand-review";

import {
  getDisplayedTableState
} from "./displayed-table-state";

function createState(): HandReviewDecisionState {
  return {
    street: "river",
    board: [],
    pot: 7700,
    currentBet: 0,
    minimumRaise: 100,
    playerContributions: {
      Pluribus: 0,
      MrBlue: 0
    },
    totalContributions: {
      Pluribus: 3175,
      MrBlue: 3175
    },
    players: [
      {
        id: "Pluribus",
        name: "Pluribus",
        position: "MP",
        stack: 6825,
        status: "active"
      },
      {
        id: "MrBlue",
        name: "MrBlue",
        position: "BTN",
        stack: 6825,
        status: "active"
      }
    ]
  };
}

describe(
  "getDisplayedTableState",
  () => {
    it(
      "applies an all-in bet to the displayed state",
      () => {
        const action: HandReviewAction = {
          actionIndex: 15,
          playerId: "MrBlue",
          street: "river",
          type: "bet",
          amount: 6825,
          state: createState()
        };

        const result =
          getDisplayedTableState(
            createState(),
            action
          );

        expect(result.pot).toBe(
          14525
        );

        expect(
          result.playerContributions
            .MrBlue
        ).toBe(6825);

        expect(
          result.players.find(
            player =>
              player.id === "MrBlue"
          )
        ).toMatchObject({
          stack: 0,
          status: "all_in"
        });
      }
    );

    it(
      "applies the following all-in call",
      () => {
        const state =
          createState();

        state.pot = 14525;
        state.currentBet = 6825;
        state.playerContributions = {
          Pluribus: 0,
          MrBlue: 6825
        };

        state.players = state.players.map(
          player =>
            player.id === "MrBlue"
              ? {
                ...player,
                stack: 0,
                status:
                  "all_in"
              }
              : player
        );

        const action: HandReviewAction = {
          actionIndex: 16,
          playerId: "Pluribus",
          street: "river",
          type: "call",
          amount: 6825,
          state
        };

        const result =
          getDisplayedTableState(
            state,
            action
          );

        expect(result.pot).toBe(
          21350
        );

        expect(
          result.playerContributions
            .Pluribus
        ).toBe(6825);

        expect(
          result.players.find(
            player =>
              player.id ===
              "Pluribus"
          )
        ).toMatchObject({
          stack: 0,
          status: "all_in"
        });
      }
    );

    it(
      "shows a fold immediately",
      () => {
        const state =
          createState();

        const action: HandReviewAction = {
          actionIndex: 1,
          playerId: "Pluribus",
          street: "river",
          type: "fold",
          amount: 0,
          state
        };

        const result =
          getDisplayedTableState(
            state,
            action
          );

        expect(
          result.players.find(
            player =>
              player.id ===
              "Pluribus"
          )?.status
        ).toBe("folded");

        expect(result.pot).toBe(
          7700
        );
      }
    );
  }
);