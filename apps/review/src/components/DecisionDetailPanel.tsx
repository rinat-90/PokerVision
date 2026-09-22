import type {
  HandReviewDecision,
} from "@poker-vision/hand-review";

import {
  formatAction,
  formatStreet,
} from "../utils/format";

interface DecisionDetailPanelProps {
  decision:
    | HandReviewDecision
    | undefined;
}

function formatPercentage(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  return value.toFixed(1);
}

function formatExpectedValue(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  if (value > 0) {
    return `+${value.toFixed(1)}`;
  }

  return value.toFixed(1);
}

function formatSkipReason(
  reason:
    | HandReviewDecision["skipReason"]
    | undefined,
): string {
  if (
    reason === "action_not_supported"
  ) {
    return "Action not supported";
  }

  if (
    reason ===
    "fold_probability_required"
  ) {
    return "Fold probability required";
  }

  return "—";
}

export function DecisionDetailPanel({
                                      decision,
                                    }: DecisionDetailPanelProps) {
  return (
    <section className="panel decision-detail-panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Decision
          </span>

          <h2>
            Decision Detail
          </h2>
        </div>

        {decision && (
          <span className="status">
            {decision.status}
          </span>
        )}
      </div>

      {decision ? (
        <div className="decision-detail-grid">
          <div>
            <span>Street</span>
            <strong>
              {formatStreet(
                decision.street,
              )}
            </strong>
          </div>

          <div>
            <span>Action</span>
            <strong>
              {formatAction(
                decision.action,
              )}
            </strong>
          </div>

          <div>
            <span>Amount</span>
            <strong>
              {formatNumber(
                decision.amount,
              )}
            </strong>
          </div>

          <div>
            <span>Pot</span>
            <strong>
              {formatNumber(
                decision.pot,
              )}
            </strong>
          </div>

          <div>
            <span>Call amount</span>
            <strong>
              {formatNumber(
                decision.callAmount,
              )}
            </strong>
          </div>

          <div>
            <span>Equity</span>
            <strong>
              {formatPercentage(
                decision.equity,
              )}
            </strong>
          </div>

          <div>
            <span>Pot odds</span>
            <strong>
              {formatPercentage(
                decision.potOdds,
              )}
            </strong>
          </div>

          <div>
            <span>EV</span>
            <strong>
              {formatExpectedValue(
                decision.expectedValue,
              )}
            </strong>
          </div>

          <div>
            <span>Decision</span>
            <strong>
              {decision.decision ?? "—"}
            </strong>
          </div>

          {decision.status ===
            "skipped" && (
              <div>
                <span>Skip reason</span>
                <strong>
                  {formatSkipReason(
                    decision.skipReason,
                  )}
                </strong>
              </div>
            )}
        </div>
      ) : (
        <div className="empty-state">
          Select a decision to inspect it.
        </div>
      )}
    </section>
  );
}