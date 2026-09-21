import type {
  HandReviewDecision
} from "../model/hand-review";

import {
  formatAction,
  formatNumber,
  formatPercentage,
  formatStreet
} from "../utils/format";

interface AnalysisPanelProps {
  decision?: HandReviewDecision;
  playerName: string;
  action: string;
  amount: number;
}

export function AnalysisPanel({
                                decision,
                                playerName,
                                action,
                                amount
                              }: AnalysisPanelProps) {
  if (decision === undefined) {
    return (
      <section className="panel analysis-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              Action
            </span>

            <h2>
              {playerName}
            </h2>
          </div>
        </div>

        <div className="decision-action">
          <span>
            Action
          </span>

          <strong>
            {formatAction(action)}
            {amount > 0
              ? ` ${amount}`
              : ""}
          </strong>
        </div>

        <div className="analysis-result">
          <span className="panel-label">
            Analysis
          </span>

          <strong>
            No analysis for this action
          </strong>
        </div>
      </section>
    );
  }

  return (
    <section className="panel analysis-panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Analysis
          </span>

          <h2>
            Hero decision
          </h2>
        </div>

        <span className="analyzed-badge">
          {decision.status}
        </span>
      </div>

      <div className="decision-action">
        <span>
          Action
        </span>

        <strong>
          {formatAction(
            decision.action
          )}{" "}
          {decision.amount}
        </strong>
      </div>

      <div className="metrics">
        <div className="metric">
          <span>Pot</span>

          <strong>
            {decision.state?.pot ??
              decision.pot}
          </strong>
        </div>

        <div className="metric">
          <span>To call</span>

          <strong>
            {decision.callAmount}
          </strong>
        </div>

        <div className="metric">
          <span>Amount</span>

          <strong>
            {decision.amount}
          </strong>
        </div>

        <div className="metric">
          <span>Street</span>

          <strong>
            {formatStreet(
              decision.state?.street ??
              decision.street
            )}
          </strong>
        </div>
      </div>

      <div className="analysis-result">
        <span className="panel-label">
          Decision result
        </span>

        <strong>
          {decision.decision !== undefined
            ? formatAction(
              decision.decision
            )
            : "No recommendation"}
        </strong>

        <div className="metrics result-metrics">
          <div className="metric">
            <span>Equity</span>

            <strong>
              {formatPercentage(
                decision.equity
              )}
            </strong>
          </div>

          <div className="metric">
            <span>Pot odds</span>

            <strong>
              {formatPercentage(
                decision.potOdds
              )}
            </strong>
          </div>

          <div className="metric">
            <span>Expected value</span>

            <strong>
              {formatNumber(
                decision.expectedValue
              )}
            </strong>
          </div>

          <div className="metric">
            <span>Status</span>

            <strong>
              {formatAction(
                decision.status
              )}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}