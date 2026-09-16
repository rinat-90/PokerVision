import {
  describe,
  expect,
  it
} from "vitest";

import type {
  Player,
  PlayerAction,
  Position
} from "@poker-vision/poker-engine";

import {
  reconstructBettingState
} from "./betting-state.js";

function createPlayers(): Player[] {
  return [
    {
      id: "hero",
      name: "Hero",
      position: "BTN",
      stack: 100,
      status: "active"
    },
    {
      id: "villain",
      name: "Villain",
      position: "BB",
      stack: 100,
      status: "active"
    }
  ];
}

function createPlayer(
  id: string,
  position: Position
): Player {
  return {
    id,
    name: id,
    position,
    stack: 100,
    status: "active"
  };
}

describe(
  "reconstructBettingState",
  () => {
    it(
      "finds the player who needs to respond to a bet",
      () => {
        const actions: PlayerAction[] = [
          {
            playerId: "hero",
            type: "bet",
            amount: 8,
            street: "flop"
          }
        ];

        const result =
          reconstructBettingState(
            createPlayers(),
            actions,
            "flop",
            8,
            {
              hero: 8,
              villain: 0
            }
          );

        expect(
          result.currentPlayerId
        ).toBe("villain");

        expect(
          result.playersToAct
        ).toEqual(["villain"]);

        expect(
          result.bettingRoundComplete
        ).toBe(false);
      }
    );

    it(
      "completes the round after bet and call",
      () => {
        const actions: PlayerAction[] = [
          {
            playerId: "hero",
            type: "bet",
            amount: 8,
            street: "flop"
          },
          {
            playerId: "villain",
            type: "call",
            amount: 8,
            street: "flop"
          }
        ];

        const result =
          reconstructBettingState(
            createPlayers(),
            actions,
            "flop",
            8,
            {
              hero: 8,
              villain: 8
            }
          );

        expect(
          result.currentPlayerId
        ).toBeNull();

        expect(
          result.playersToAct
        ).toEqual([]);

        expect(
          result.bettingRoundComplete
        ).toBe(true);
      }
    );

    it(
      "completes the round after check and check",
      () => {
        const actions: PlayerAction[] = [
          {
            playerId: "villain",
            type: "check",
            amount: 0,
            street: "flop"
          },
          {
            playerId: "hero",
            type: "check",
            amount: 0,
            street: "flop"
          }
        ];

        const result =
          reconstructBettingState(
            createPlayers(),
            actions,
            "flop",
            0,
            {
              hero: 0,
              villain: 0
            }
          );

        expect(
          result.currentPlayerId
        ).toBeNull();

        expect(
          result.playersToAct
        ).toEqual([]);

        expect(
          result.bettingRoundComplete
        ).toBe(true);
      }
    );

    it(
      "keeps the opponent to act after a bet",
      () => {
        const actions: PlayerAction[] = [
          {
            playerId: "hero",
            type: "bet",
            amount: 8,
            street: "flop"
          }
        ];

        const result =
          reconstructBettingState(
            createPlayers(),
            actions,
            "flop",
            8,
            {
              hero: 8,
              villain: 0
            }
          );

        expect(
          result.playersToAct
        ).toEqual(["villain"]);

        expect(
          result.bettingRoundComplete
        ).toBe(false);
      }
    );

    it(
      "completes the round after a fold",
      () => {
        const actions: PlayerAction[] = [
          {
            playerId: "hero",
            type: "bet",
            amount: 8,
            street: "flop"
          },
          {
            playerId: "villain",
            type: "fold",
            amount: 0,
            street: "flop"
          }
        ];

        const players =
          createPlayers();

        players[1]!.status =
          "folded";

        const result =
          reconstructBettingState(
            players,
            actions,
            "flop",
            8,
            {
              hero: 8,
              villain: 0
            }
          );

        expect(
          result.currentPlayerId
        ).toBeNull();

        expect(
          result.playersToAct
        ).toEqual([]);

        expect(
          result.bettingRoundComplete
        ).toBe(true);
      }
    );

    it(
      "does not require action from a folded player",
      () => {
        const players =
          createPlayers();

        players[1]!.status =
          "folded";

        const actions: PlayerAction[] = [
          {
            playerId: "villain",
            type: "fold",
            amount: 0,
            street: "flop"
          }
        ];

        const result =
          reconstructBettingState(
            players,
            actions,
            "flop",
            0,
            {
              hero: 0,
              villain: 0
            }
          );

        expect(
          result.currentPlayerId
        ).toBeNull();

        expect(
          result.playersToAct
        ).toEqual([]);

        expect(
          result.bettingRoundComplete
        ).toBe(true);
      }
    );

    describe(
      "preflop first actor",
      () => {
        it(
          "starts with UTG in a 6-max hand",
          () => {
            const players = [
              createPlayer(
                "utg",
                "UTG"
              ),
              createPlayer(
                "hj",
                "HJ"
              ),
              createPlayer(
                "co",
                "CO"
              ),
              createPlayer(
                "btn",
                "BTN"
              ),
              createPlayer(
                "sb",
                "SB"
              ),
              createPlayer(
                "bb",
                "BB"
              )
            ];

            const result =
              reconstructBettingState(
                players,
                [],
                "preflop",
                2,
                {
                  utg: 0,
                  hj: 0,
                  co: 0,
                  btn: 0,
                  sb: 1,
                  bb: 2
                }
              );

            expect(
              result.currentPlayerId
            ).toBe("utg");
          }
        );

        it(
          "starts with UTG+1 in an 8-max hand",
          () => {
            const players = [
              createPlayer(
                "utg",
                "UTG"
              ),
              createPlayer(
                "utg1",
                "UTG+1"
              ),
              createPlayer(
                "mp",
                "MP"
              ),
              createPlayer(
                "hj",
                "HJ"
              ),
              createPlayer(
                "co",
                "CO"
              ),
              createPlayer(
                "btn",
                "BTN"
              ),
              createPlayer(
                "sb",
                "SB"
              ),
              createPlayer(
                "bb",
                "BB"
              )
            ];

            const result =
              reconstructBettingState(
                players,
                [],
                "preflop",
                2,
                {
                  utg: 0,
                  utg1: 0,
                  mp: 0,
                  hj: 0,
                  co: 0,
                  btn: 0,
                  sb: 1,
                  bb: 2
                }
              );

            expect(
              result.currentPlayerId
            ).toBe("utg");
          }
        );

        it(
          "starts with BB in heads-up preflop",
          () => {
            const players = [
              createPlayer(
                "btn",
                "BTN"
              ),
              createPlayer(
                "bb",
                "BB"
              )
            ];

            const result =
              reconstructBettingState(
                players,
                [],
                "preflop",
                1,
                {
                  btn: 1,
                  bb: 2
                }
              );

            expect(
              result.currentPlayerId
            ).toBe("bb");
          }
        );

        it(
          "moves to HJ after UTG folds",
          () => {
            const players = [
              createPlayer(
                "utg",
                "UTG"
              ),
              createPlayer(
                "hj",
                "HJ"
              ),
              createPlayer(
                "co",
                "CO"
              ),
              createPlayer(
                "btn",
                "BTN"
              ),
              createPlayer(
                "sb",
                "SB"
              ),
              createPlayer(
                "bb",
                "BB"
              )
            ];

            const actions: PlayerAction[] = [
              {
                playerId: "utg",
                type: "fold",
                amount: 0,
                street: "preflop"
              }
            ];

            const result =
              reconstructBettingState(
                players,
                actions,
                "preflop",
                2,
                {
                  utg: 0,
                  hj: 0,
                  co: 0,
                  btn: 0,
                  sb: 1,
                  bb: 2
                }
              );

            expect(
              result.currentPlayerId
            ).toBe("hj");
          }
        );

        it(
          "moves to HJ after UTG calls",
          () => {
            const players = [
              createPlayer(
                "utg",
                "UTG"
              ),
              createPlayer(
                "hj",
                "HJ"
              ),
              createPlayer(
                "co",
                "CO"
              ),
              createPlayer(
                "btn",
                "BTN"
              ),
              createPlayer(
                "sb",
                "SB"
              ),
              createPlayer(
                "bb",
                "BB"
              )
            ];

            const actions: PlayerAction[] = [
              {
                playerId: "utg",
                type: "call",
                amount: 2,
                street: "preflop"
              }
            ];

            const result =
              reconstructBettingState(
                players,
                actions,
                "preflop",
                2,
                {
                  utg: 2,
                  hj: 0,
                  co: 0,
                  btn: 0,
                  sb: 1,
                  bb: 2
                }
              );

            expect(
              result.currentPlayerId
            ).toBe("hj");
          }
        );

        it(
          "keeps all remaining players to act after a raise",
          () => {
            const players = [
              createPlayer(
                "utg",
                "UTG"
              ),
              createPlayer(
                "hj",
                "HJ"
              ),
              createPlayer(
                "co",
                "CO"
              ),
              createPlayer(
                "btn",
                "BTN"
              ),
              createPlayer(
                "sb",
                "SB"
              ),
              createPlayer(
                "bb",
                "BB"
              )
            ];

            const actions: PlayerAction[] = [
              {
                playerId: "utg",
                type: "raise",
                amount: 6,
                street: "preflop"
              }
            ];

            const result =
              reconstructBettingState(
                players,
                actions,
                "preflop",
                6,
                {
                  utg: 6,
                  hj: 0,
                  co: 0,
                  btn: 0,
                  sb: 1,
                  bb: 2
                }
              );

            expect(
              result.currentPlayerId
            ).toBe("hj");

            expect(
              result.playersToAct
            ).toEqual([
              "hj",
              "co",
              "btn",
              "sb",
              "bb"
            ]);

            expect(
              result.bettingRoundComplete
            ).toBe(false);
          }
        );

        it(
          "returns action to the original raiser after a re-raise",
          () => {
            const players = [
              createPlayer("utg", "UTG"),
              createPlayer("hj", "HJ"),
              createPlayer("co", "CO"),
              createPlayer("btn", "BTN"),
              createPlayer("sb", "SB"),
              createPlayer("bb", "BB")
            ];

            const actions: PlayerAction[] = [
              {
                playerId: "utg",
                type: "raise",
                amount: 6,
                street: "preflop"
              },
              {
                playerId: "hj",
                type: "raise",
                amount: 18,
                street: "preflop"
              }
            ];

            const result =
              reconstructBettingState(
                players,
                actions,
                "preflop",
                18,
                {
                  utg: 6,
                  hj: 18,
                  co: 0,
                  btn: 0,
                  sb: 1,
                  bb: 2
                }
              );

            expect(
              result.currentPlayerId
            ).toBe("co");

            expect(
              result.playersToAct
            ).toEqual([
              "co",
              "btn",
              "sb",
              "bb",
              "utg"
            ]);

            expect(
              result.bettingRoundComplete
            ).toBe(false);
          }
        );

        it(
          "moves to CO when UTG raises and HJ folds",
          () => {
            const players = [
              createPlayer(
                "utg",
                "UTG"
              ),
              createPlayer(
                "hj",
                "HJ"
              ),
              createPlayer(
                "co",
                "CO"
              ),
              createPlayer(
                "btn",
                "BTN"
              ),
              createPlayer(
                "sb",
                "SB"
              ),
              createPlayer(
                "bb",
                "BB"
              )
            ];

            const actions: PlayerAction[] = [
              {
                playerId: "utg",
                type: "raise",
                amount: 6,
                street: "preflop"
              },
              {
                playerId: "hj",
                type: "fold",
                amount: 0,
                street: "preflop"
              }
            ];

            const result =
              reconstructBettingState(
                players,
                actions,
                "preflop",
                6,
                {
                  utg: 6,
                  hj: 0,
                  co: 0,
                  btn: 0,
                  sb: 1,
                  bb: 2
                }
              );

            expect(
              result.currentPlayerId
            ).toBe("co");

            expect(
              result.playersToAct
            ).toEqual([
              "co",
              "btn",
              "sb",
              "bb"
            ]);

            expect(
              result.bettingRoundComplete
            ).toBe(false);
          }
        );
      }
    );

    it(
      "completes preflop after everyone calls the big blind",
      () => {
        const players = [
          createPlayer(
            "utg",
            "UTG"
          ),
          createPlayer(
            "hj",
            "HJ"
          ),
          createPlayer(
            "co",
            "CO"
          ),
          createPlayer(
            "btn",
            "BTN"
          ),
          createPlayer(
            "sb",
            "SB"
          ),
          createPlayer(
            "bb",
            "BB"
          )
        ];

        const actions: PlayerAction[] = [
          {
            playerId: "utg",
            type: "call",
            amount: 2,
            street: "preflop"
          },
          {
            playerId: "hj",
            type: "call",
            amount: 2,
            street: "preflop"
          },
          {
            playerId: "co",
            type: "call",
            amount: 2,
            street: "preflop"
          },
          {
            playerId: "btn",
            type: "call",
            amount: 2,
            street: "preflop"
          },
          {
            playerId: "sb",
            type: "call",
            amount: 1,
            street: "preflop"
          }
        ];

        const result =
          reconstructBettingState(
            players,
            actions,
            "preflop",
            2,
            {
              utg: 2,
              hj: 2,
              co: 2,
              btn: 2,
              sb: 2,
              bb: 2
            }
          );

        expect(
          result.currentPlayerId
        ).toBe("bb");

        expect(
          result.playersToAct
        ).toEqual([
          "bb"
        ]);

        expect(
          result.bettingRoundComplete
        ).toBe(false);
      }
    );

    it(
      "completes preflop when BB checks after everyone calls",
      () => {
        const players = [
          createPlayer(
            "utg",
            "UTG"
          ),
          createPlayer(
            "hj",
            "HJ"
          ),
          createPlayer(
            "co",
            "CO"
          ),
          createPlayer(
            "btn",
            "BTN"
          ),
          createPlayer(
            "sb",
            "SB"
          ),
          createPlayer(
            "bb",
            "BB"
          )
        ];

        const actions: PlayerAction[] = [
          {
            playerId: "utg",
            type: "call",
            amount: 2,
            street: "preflop"
          },
          {
            playerId: "hj",
            type: "call",
            amount: 2,
            street: "preflop"
          },
          {
            playerId: "co",
            type: "call",
            amount: 2,
            street: "preflop"
          },
          {
            playerId: "btn",
            type: "call",
            amount: 2,
            street: "preflop"
          },
          {
            playerId: "sb",
            type: "call",
            amount: 1,
            street: "preflop"
          },
          {
            playerId: "bb",
            type: "check",
            amount: 0,
            street: "preflop"
          }
        ];

        const result =
          reconstructBettingState(
            players,
            actions,
            "preflop",
            2,
            {
              utg: 2,
              hj: 2,
              co: 2,
              btn: 2,
              sb: 2,
              bb: 2
            }
          );

        expect(
          result.currentPlayerId
        ).toBeNull();

        expect(
          result.playersToAct
        ).toEqual([]);

        expect(
          result.bettingRoundComplete
        ).toBe(true);
      }
    );
  }
);