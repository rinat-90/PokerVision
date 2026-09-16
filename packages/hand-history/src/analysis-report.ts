import type {
  HandHistoryAnalysis
} from "./analyze-hand-history.js";

export interface AnalysisReportDecision {
  actionIndex: number;
  street: string;
  action: string;
  amount: number;
  pot: number;
  callAmount: number;
  equity: number;
  potOdds: number;
  expectedValue: number;
  decision: string;
}

export interface AnalysisReport {
  handId: string;
  summary: {
    totalDecisionPoints: number;
    analyzedDecisionPoints: number;
    callDecisions: number;
  };
  decisions: AnalysisReportDecision[];
}

export function createAnalysisReport(
  analysis: HandHistoryAnalysis
): AnalysisReport {
  return {
    handId: analysis.handId,

    summary: {
      ...analysis.summary
    },

    decisions: analysis.decisions.map(
      (decision) => ({
        actionIndex:
        decision.actionIndex,

        street:
        decision.context.street,

        action:
        decision.action.type,

        amount:
        decision.action.amount,

        pot:
        decision.context.pot,

        callAmount:
        decision.context.callAmount,

        equity:
        decision.analysis.equity,

        potOdds:
          decision.analysis.potOdds ?? 0,

        expectedValue:
          decision.analysis.expectedValue ?? 0,

        decision:
        decision.analysis.decision
      })
    )
  };
}