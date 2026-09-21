import type {
  AnalysisReport,
  HandHistory
} from "@poker-vision/hand-history";

import {
  createHandReview
} from "./model/create-hand-review";

const history: HandHistory = {
  id: "video-e2e-analysis",

  gameFormat: "cash",

  smallBlind: 25,
  bigBlind: 50,
  ante: 0,

  players: [
    {
      id: "hero",
      name: "Hero",
      position: "BTN",
      startingStack: 5000,

      holeCards: [
        {
          rank: "A",
          suit: "spades"
        },
        {
          rank: "K",
          suit: "spades"
        }
      ]
    },
    {
      id: "villain",
      name: "Villain",
      position: "BB",
      startingStack: 5000
    }
  ],

  forcedBets: [
    {
      playerId: "hero",
      type: "small_blind",
      amount: 25
    },
    {
      playerId: "villain",
      type: "big_blind",
      amount: 50
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
          amount: 150,
          amountType: "total",
          street: "preflop"
        },
        {
          playerId: "villain",
          type: "call",
          amount: 150,
          amountType: "total",
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
          suit: "hearts"
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
          type: "bet",
          amount: 100,
          amountType: "total",
          street: "flop"
        }
      ]
    }
  ],

  startedAt: 10,
  completedAt: 30
};

const report: AnalysisReport = {
  handId: "video-e2e-analysis",

  summary: {
    totalDecisionPoints: 2,
    analyzedDecisionPoints: 2,
    skippedDecisionPoints: 0,
    callDecisions: 0
  },

  decisions: [
    {
      actionIndex: 0,
      street: "preflop",
      action: "raise",
      amount: 125,
      pot: 75,
      callAmount: 25,
      status: "analyzed",
      equity: 0.64,
      expectedValue: 42.5,
      decision: "raise"
    },
    {
      actionIndex: 3,
      street: "flop",
      action: "bet",
      amount: 100,
      pot: 375,
      callAmount: 0,
      status: "analyzed",
      equity: 0.72,
      expectedValue: 68.25,
      decision: "bet"
    }
  ]
};

export const sampleHandReview =
  createHandReview(
    history,
    report
  );