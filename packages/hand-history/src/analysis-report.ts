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

  status:
    | "analyzed"
    | "skipped";

  skipReason?:
    | "action_not_supported"
    | "fold_probability_required";

  equity?: number;
  potOdds?: number;
  expectedValue?: number;
  decision?: string;
}

export interface AnalysisReport {
  handId: string;

  summary: {
    totalDecisionPoints: number;
    analyzedDecisionPoints: number;
    skippedDecisionPoints: number;
    callDecisions: number;
  };

  decisions: AnalysisReportDecision[];
}

export function createAnalysisReport(
  analysis: HandHistoryAnalysis
): AnalysisReport {
  return {
    handId:
    analysis.handId,

    summary: {
      ...analysis.summary
    },

    decisions:
      analysis.decisions.map(
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

          status:
          decision.status,

          ...(decision.skipReason !== undefined
            ? {
              skipReason:
              decision.skipReason
            }
            : {}),

          ...(decision.analysis !== undefined
            ? {
              equity:
              decision.analysis.equity,

              ...(decision.analysis.potOdds !== undefined
                ? {
                  potOdds:
                  decision.analysis.potOdds
                }
                : {}),

              ...(decision.analysis.expectedValue !== undefined
                ? {
                  expectedValue:
                  decision.analysis.expectedValue
                }
                : {}),

              decision:
              decision.analysis.decision
            }
            : {})
        })
      )
  };
}