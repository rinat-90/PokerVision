import {
  readFileSync
} from "node:fs";

import {
  resolve
} from "node:path";

import {
  describe,
  expect,
  it
} from "vitest";

import {
  findDecisionPoints
} from "./decision-points.js";

import {
  parsePluribusHand
} from "./parsers/pluribus.js";

import type {
  HandHistory
} from "./types.js";

describe("findDecisionPoints", () => {
  it("finds actions when the requested player is expected to act", () => {
    const hand: HandHistory = {
      id: "test-hand",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      ante: 0,
      players: [
        {
          id: "hero",
          name: "Hero",
          position: "BTN",
          startingStack: 200
        },
        {
          id: "villain",
          name: "Villain",
          position: "BB",
          startingStack: 200
        }
      ],
      forcedBets: [
        {
          playerId: "hero",
          type: "small_blind",
          amount: 1
        },
        {
          playerId: "villain",
          type: "big_blind",
          amount: 2
        }
      ],
      streets: [
        {
          street: "preflop",
          board: [],
          actions: [
            {
              playerId: "villain",
              type: "check",
              amount: 0,
              amountType: "contribution",
              street: "preflop"
            },
            {
              playerId: "hero",
              type: "raise",
              amount: 5,
              amountType: "contribution",
              street: "preflop"
            }
          ]
        },
        {
          street: "flop",
          board: [
            {
              rank: "2",
              suit: "clubs"
            },
            {
              rank: "7",
              suit: "diamonds"
            },
            {
              rank: "K",
              suit: "spades"
            }
          ],
          actions: [
            {
              playerId: "villain",
              type: "check",
              amount: 0,
              amountType: "contribution",
              street: "flop"
            },
            {
              playerId: "hero",
              type: "check",
              amount: 0,
              amountType: "contribution",
              street: "flop"
            }
          ]
        }
      ]
    };

    const result =
      findDecisionPoints(
        hand,
        {
          playerId: "hero"
        }
      );

    expect(result).toHaveLength(2);

    expect(result[0]).toEqual({
      actionIndex: 1,
      playerId: "hero",
      street: "preflop",
      action: {
        playerId: "hero",
        type: "raise",
        amount: 5,
        street: "preflop"
      }
    });

    expect(result[1]).toEqual({
      actionIndex: 3,
      playerId: "hero",
      street: "flop",
      action: {
        playerId: "hero",
        type: "check",
        amount: 0,
        street: "flop"
      }
    });
  });

  it("does not include forced bets as decision points", () => {
    const hand: HandHistory = {
      id: "test-hand",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      ante: 0,
      players: [
        {
          id: "hero",
          name: "Hero",
          position: "BTN",
          startingStack: 200
        },
        {
          id: "villain",
          name: "Villain",
          position: "BB",
          startingStack: 200
        }
      ],
      forcedBets: [
        {
          playerId: "hero",
          type: "small_blind",
          amount: 1
        },
        {
          playerId: "villain",
          type: "big_blind",
          amount: 2
        }
      ],
      streets: [
        {
          street: "preflop",
          board: [],
          actions: [
            {
              playerId: "villain",
              type: "check",
              amount: 0,
              amountType: "contribution",
              street: "preflop"
            },
            {
              playerId: "hero",
              type: "call",
              amount: 1,
              amountType: "contribution",
              street: "preflop"
            }
          ]
        }
      ]
    };

    const result =
      findDecisionPoints(
        hand,
        {
          playerId: "hero"
        }
      );

    expect(result).toHaveLength(1);
    expect(result[0]?.actionIndex).toBe(1);
    expect(result[0]?.action.type).toBe("call");
  });

  it("ignores an action when the player is not expected to act", () => {
    const hand: HandHistory = {
      id: "invalid-order-hand",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      ante: 0,
      players: [
        {
          id: "hero",
          name: "Hero",
          position: "BTN",
          startingStack: 100
        },
        {
          id: "villain",
          name: "Villain",
          position: "BB",
          startingStack: 100
        }
      ],
      forcedBets: [
        {
          playerId: "hero",
          type: "small_blind",
          amount: 1
        },
        {
          playerId: "villain",
          type: "big_blind",
          amount: 2
        }
      ],
      streets: [
        {
          street: "preflop",
          board: [],
          actions: [
            {
              playerId: "hero",
              type: "raise",
              amount: 5,
              amountType: "contribution",
              street: "preflop"
            },
            {
              playerId: "hero",
              type: "call",
              amount: 1,
              amountType: "contribution",
              street: "preflop"
            }
          ]
        }
      ]
    };

    const result =
      findDecisionPoints(
        hand,
        {
          playerId: "hero"
        }
      );

    expect(result).toHaveLength(0);
  });

  it("finds all decision points for MrBlue in Pluribus hand 100000", () => {
    const fixturePath =
      resolve(
        process.cwd(),
        "packages/hand-history/fixtures/pluribus/pluribus_100.txt"
      );

    const text =
      readFileSync(
        fixturePath,
        "utf8"
      );

    const handStart =
      text.indexOf(
        "PokerStars Hand #100000:"
      );

    const handEnd =
      text.indexOf(
        "PokerStars Hand #100001:"
      );

    expect(handStart).toBeGreaterThanOrEqual(0);
    expect(handEnd).toBeGreaterThan(handStart);

    const handText =
      text.slice(
        handStart,
        handEnd
      );

    const hand =
      parsePluribusHand(
        handText
      );

    const result =
      findDecisionPoints(
        hand,
        {
          playerId: "MrBlue"
        }
      );

    expect(result).toHaveLength(4);

    expect(
      result.map(
        (decision) => ({
          actionIndex:
          decision.actionIndex,
          street:
          decision.street,
          type:
          decision.action.type
        })
      )
    ).toEqual([
      {
        actionIndex: 4,
        street: "preflop",
        type: "call"
      },
      {
        actionIndex: 6,
        street: "flop",
        type: "check"
      },
      {
        actionIndex: 8,
        street: "turn",
        type: "check"
      },
      {
        actionIndex: 10,
        street: "river",
        type: "bet"
      }
    ]);
  });
});