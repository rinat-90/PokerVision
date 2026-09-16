import {
  describe,
  expect,
  it
} from "vitest";

import {
  createRange
} from "@poker-vision/poker-engine";

import {
  analyzeHandHistory
} from "./analyze-hand-history.js";

import type {
  HandHistory
} from "./types.js";

describe("analyzeHandHistory", () => {
  it("analyzes Hero call decisions using the state before the action", () => {
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
          startingStack: 200,
          holeCards: [
            {
              rank: "A",
              suit: "hearts"
            },
            {
              rank: "A",
              suit: "diamonds"
            }
          ]
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
              playerId: "hero",
              type: "raise",
              amount: 5,
              amountType: "contribution",
              street: "preflop"
            },
            {
              playerId: "villain",
              type: "call",
              amount: 4,
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
              playerId: "hero",
              type: "bet",
              amount: 10,
              amountType: "contribution",
              street: "flop"
            },
            {
              playerId: "villain",
              type: "call",
              amount: 10,
              amountType: "contribution",
              street: "flop"
            }
          ]
        },

        {
          street: "turn",
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
            },
            {
              rank: "3",
              suit: "hearts"
            }
          ],
          actions: [
            {
              playerId: "hero",
              type: "check",
              amount: 0,
              amountType: "contribution",
              street: "turn"
            },
            {
              playerId: "villain",
              type: "bet",
              amount: 20,
              amountType: "contribution",
              street: "turn"
            },
            {
              playerId: "hero",
              type: "call",
              amount: 20,
              amountType: "contribution",
              street: "turn"
            }
          ]
        }
      ]
    };

    const villainRange =
      createRange([
        "QQ",
        "JJ",
        "TT",
        "AK"
      ]);

    const result =
      analyzeHandHistory(
        hand,
        {
          heroPlayerId: "hero",
          villainRange
        }
      );

    expect(result.handId)
      .toBe("test-hand");

    expect(result.summary)
      .toEqual({
        totalDecisionPoints: 3,
        analyzedDecisionPoints: 1,
        callDecisions: 1
      });

    expect(result.decisions)
      .toHaveLength(1);

    const decision =
      result.decisions[0];

    expect(decision)
      .toBeDefined();

    expect(decision?.actionIndex)
      .toBe(6);

    expect(decision?.action)
      .toEqual({
        playerId: "hero",
        type: "call",
        amount: 20,
        street: "turn"
      });

    expect(decision?.context.playerId)
      .toBe("hero");

    expect(decision?.context.street)
      .toBe("turn");

    expect(decision?.context.heroCards)
      .toEqual([
        {
          rank: "A",
          suit: "hearts"
        },
        {
          rank: "A",
          suit: "diamonds"
        }
      ]);

    expect(decision?.context.board)
      .toEqual([
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
        },
        {
          rank: "3",
          suit: "hearts"
        }
      ]);

    expect(decision?.context.pot)
      .toBe(52);

    expect(decision?.context.currentBet)
      .toBe(20);

    expect(decision?.context.playerContribution)
      .toBe(0);

    expect(decision?.context.callAmount)
      .toBe(20);

    expect(decision?.context.targetAction)
      .toEqual({
        playerId: "hero",
        type: "call",
        amount: 20,
        street: "turn"
      });

    expect(decision?.analysis.potOdds)
      .toBeDefined();

    expect(decision?.analysis.expectedValue)
      .toBeDefined();

    expect(decision?.analysis.equity)
      .toBeGreaterThan(0);

    expect(decision?.analysis.validVillainCombos)
      .toBeGreaterThan(0);
  });

  it("reports analyzed call decisions in the summary", () => {
    const hand: HandHistory = {
      id: "summary-test-hand",
      gameFormat: "cash",
      smallBlind: 1,
      bigBlind: 2,
      ante: 0,

      players: [
        {
          id: "hero",
          name: "Hero",
          position: "BTN",
          startingStack: 200,
          holeCards: [
            {
              rank: "A",
              suit: "hearts"
            },
            {
              rank: "A",
              suit: "diamonds"
            }
          ]
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
              playerId: "hero",
              type: "raise",
              amount: 5,
              amountType: "contribution",
              street: "preflop"
            },
            {
              playerId: "villain",
              type: "call",
              amount: 4,
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
              playerId: "hero",
              type: "bet",
              amount: 10,
              amountType: "contribution",
              street: "flop"
            },
            {
              playerId: "villain",
              type: "call",
              amount: 10,
              amountType: "contribution",
              street: "flop"
            }
          ]
        },

        {
          street: "turn",
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
            },
            {
              rank: "3",
              suit: "hearts"
            }
          ],
          actions: [
            {
              playerId: "hero",
              type: "check",
              amount: 0,
              amountType: "contribution",
              street: "turn"
            },
            {
              playerId: "villain",
              type: "bet",
              amount: 20,
              amountType: "contribution",
              street: "turn"
            },
            {
              playerId: "hero",
              type: "call",
              amount: 20,
              amountType: "contribution",
              street: "turn"
            }
          ]
        }
      ]
    };

    const villainRange =
      createRange([
        "QQ",
        "JJ",
        "TT",
        "AK"
      ]);

    const result =
      analyzeHandHistory(
        hand,
        {
          heroPlayerId: "hero",
          villainRange
        }
      );

    expect(result.summary)
      .toEqual({
        totalDecisionPoints: 3,
        analyzedDecisionPoints: 1,
        callDecisions: 1
      });

    expect(result.decisions)
      .toHaveLength(1);

    expect(result.decisions[0]?.action.type)
      .toBe("call");
  });
});