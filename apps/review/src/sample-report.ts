import type {
  AnalysisReport
} from "@poker-vision/hand-history";

export const sampleReport: AnalysisReport = {
  handId: "video-e2e-analysis",
  heroPlayerId: "hero",

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
      pot: 175,
      callAmount: 0,
      status: "analyzed",
      equity: 0.72,
      expectedValue: 68.25,
      decision: "bet"
    }
  ]
};