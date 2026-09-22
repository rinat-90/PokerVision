import type {
  SessionDecision,
} from "../model/session-decisions";

import {
  formatAction,
  formatStreet,
} from "../utils/format";

interface DecisionComparisonPanelProps {
  left?: SessionDecision;
  right?: SessionDecision;
  onClear: () => void;
}

function formatPercentage(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function formatValue(
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

function ComparisonDecision({
                              label,
                              value,
                            }: {
  label: string;
  value?: SessionDecision;
}) {
  if (value === undefined) {
    return (
      <div className="comparison-decision empty-state">
        Select a decision
      </div>
    );
  }

  const {
    handId,
    decision,
  } = value;

  return (
    <div className="comparison-decision">
      <div className="comparison-decision-header">
        <span>{label}</span>

        <strong>
          #{handId}
        </strong>
      </div>

      <div className="comparison-metrics">
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
          <span>Pot</span>
          <strong>
            {formatValue(
              decision.pot,
            )}
          </strong>
        </div>

        <div>
          <span>Call</span>
          <strong>
            {formatValue(
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
      </div>
    </div>
  );
}

export function DecisionComparisonPanel({
                                          left,
                                          right,
                                          onClear,
                                        }: DecisionComparisonPanelProps) {
  if (
    left === undefined &&
    right === undefined
  ) {
    return null;
  }

  return (
    <section className="panel decision-comparison-panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Analysis
          </span>

          <h2>
            Decision Comparison
          </h2>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      <div className="decision-comparison-grid">
        <ComparisonDecision
          label="Decision A"
          value={left}
        />

        <ComparisonDecision
          label="Decision B"
          value={right}
        />
      </div>
    </section>
  );
}