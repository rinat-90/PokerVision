import {
  describe,
  expect,
  it
} from "vitest";

import {
  createOpponentActionHistory
} from "./action-history.js";

import type {
  PlayerAction
} from "../game-state/types.js";

describe(
  "createOpponentActionHistory",
  () => {
    it(
      "returns only actions made by the opponent before the decision",
      () => {
        const actions: PlayerAction[] = [
          {
            playerId: "hero",
            type: "raise",
            amount: 100,
            street: "preflop"
          },
          {
            playerId: "villain",
            type: "call",
            amount: 100,
            street: "preflop"
          },
          {
            playerId: "hero",
            type: "bet",
            amount: 150,
            street: "flop"
          },
          {
            playerId: "villain",
            type: "call",
            amount: 150,
            street: "flop"
          },
          {
            playerId: "hero",
            type: "bet",
            amount: 300,
            street: "turn"
          },
          {
            playerId: "villain",
            type: "fold",
            amount: 0,
            street: "turn"
          }
        ];

        const result =
          createOpponentActionHistory({
            playerId: "villain",
            actions,
            currentActionIndex: 5
          });

        expect(result)
          .toEqual({
            playerId: "villain",
            actions: [
              {
                actionIndex: 1,
                playerId: "villain",
                type: "call",
                amount: 100,
                street: "preflop"
              },
              {
                actionIndex: 3,
                playerId: "villain",
                type: "call",
                amount: 150,
                street: "flop"
              }
            ]
          });
      }
    );

    it(
      "does not include the current opponent action",
      () => {
        const actions: PlayerAction[] = [
          {
            playerId: "hero",
            type: "bet",
            amount: 100,
            street: "flop"
          },
          {
            playerId: "villain",
            type: "call",
            amount: 100,
            street: "flop"
          }
        ];

        const result =
          createOpponentActionHistory({
            playerId: "villain",
            actions,
            currentActionIndex: 1
          });

        expect(result.actions)
          .toEqual([]);
      }
    );

    it(
      "does not include actions after the decision",
      () => {
        const actions: PlayerAction[] = [
          {
            playerId: "villain",
            type: "call",
            amount: 50,
            street: "preflop"
          },
          {
            playerId: "hero",
            type: "bet",
            amount: 100,
            street: "flop"
          },
          {
            playerId: "villain",
            type: "call",
            amount: 100,
            street: "flop"
          }
        ];

        const result =
          createOpponentActionHistory({
            playerId: "villain",
            actions,
            currentActionIndex: 1
          });

        expect(result.actions)
          .toEqual([
            {
              actionIndex: 0,
              playerId: "villain",
              type: "call",
              amount: 50,
              street: "preflop"
            }
          ]);
      }
    );

    it(
      "returns an empty history when the opponent has not acted",
      () => {
        const actions: PlayerAction[] = [
          {
            playerId: "hero",
            type: "raise",
            amount: 100,
            street: "preflop"
          }
        ];

        const result =
          createOpponentActionHistory({
            playerId: "villain",
            actions,
            currentActionIndex: 1
          });

        expect(result)
          .toEqual({
            playerId: "villain",
            actions: []
          });
      }
    );
  }
);