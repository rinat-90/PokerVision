import type {
  AnalysisReport,
  AnalysisReportDecision
} from "@poker-vision/hand-history";

import {
  sampleReport
} from "./sample-report";

import {
  useState
} from "react";

import "./App.css";

function formatAction(
  action: string
): string {
  return (
    action.charAt(0).toUpperCase() +
    action.slice(1)
  );
}

function formatStreet(
  street: string
): string {
  return (
    street.charAt(0).toUpperCase() +
    street.slice(1)
  );
}

function formatPercentage(
  value: number | undefined
): string {
  if (value === undefined) {
    return "—";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(
  value: number | undefined
): string {
  if (value === undefined) {
    return "—";
  }

  return value.toFixed(2);
}

function DecisionDetails({
                           decision
                         }: {
  decision: AnalysisReportDecision;
}) {
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
            {decision.pot}
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

function ReviewApp({
                     report
                   }: {
  report: AnalysisReport;
}) {
  const [
    activeDecisionIndex,
    setActiveDecisionIndex
  ] = useState(0);

  const activeDecision =
    report.decisions[
      activeDecisionIndex
      ];

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            PV
          </div>

          <div>
            <div className="brand-name">
              PokerVision
            </div>

            <div className="brand-subtitle">
              Hand Review
            </div>
          </div>
        </div>

        <div className="topbar-actions">
          <span className="status">
            {report.summary.analyzedDecisionPoints}{" "}
            analyzed
          </span>

          <button
            className="primary-button"
            type="button"
          >
            Open hand
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="sidebar-header">
            <span>Hands</span>

            <span className="hand-count">
              1
            </span>
          </div>

          <button
            className="hand-item hand-item-active"
            type="button"
          >
            <div className="hand-item-top">
              <strong>
                {report.handId}
              </strong>

              <span>
                Review
              </span>
            </div>

            <div className="hand-item-meta">
              {
                report.summary
                  .totalDecisionPoints
              }{" "}
              decision
              {report.summary.totalDecisionPoints === 1
                ? ""
                : "s"}
            </div>

            <div className="hand-item-result">
              {
                report.summary
                  .analyzedDecisionPoints
              }{" "}
              analyzed
            </div>
          </button>
        </aside>

        <section className="review">
          <div className="review-header">
            <div>
              <div className="eyebrow">
                {report.handId}
              </div>

              <h1>
                Hand Review
              </h1>

              <p>
                Review reconstructed actions
                and decision analysis.
              </p>
            </div>

            <div className="hand-summary">
              <div>
                <span>Decisions</span>

                <strong>
                  {
                    report.summary
                      .totalDecisionPoints
                  }
                </strong>
              </div>

              <div>
                <span>Analyzed</span>

                <strong>
                  {
                    report.summary
                      .analyzedDecisionPoints
                  }
                </strong>
              </div>

              <div>
                <span>Skipped</span>

                <strong>
                  {
                    report.summary
                      .skippedDecisionPoints
                  }
                </strong>
              </div>
            </div>
          </div>

          {activeDecision !== undefined ? (
            <>
              <div className="review-grid">
                <section className="panel table-panel">
                  <div className="panel-header">
                    <div>
                      <span className="panel-label">
                        Table
                      </span>

                      <h2>
                        {formatStreet(
                          activeDecision.street
                        )}
                      </h2>
                    </div>

                    <span className="pot">
                      Pot {activeDecision.pot}
                    </span>
                  </div>

                  <div className="poker-table">
                    <div className="player player-top">
                      <span className="player-name">
                        Villain
                      </span>

                      <strong>
                        —
                      </strong>

                      <span className="position">
                        Opponent
                      </span>
                    </div>

                    <div className="felt">
                      <div className="board-placeholder">
                        Board data will be
                        connected next
                      </div>

                      <div className="pot-chip">
                        {activeDecision.pot}
                      </div>
                    </div>

                    <div className="player player-bottom">
                      <span className="player-name">
                        Hero
                      </span>

                      <strong>
                        —
                      </strong>

                      <span className="position">
                        Hero
                      </span>
                    </div>
                  </div>
                </section>

                <DecisionDetails
                  decision={
                    activeDecision
                  }
                />
              </div>

              <section className="panel timeline-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-label">
                      Timeline
                    </span>

                    <h2>
                      Decisions
                    </h2>
                  </div>
                </div>

                <div className="timeline">
                  {report.decisions.map(
                    (
                      decision,
                      index
                    ) => (
                      <button
                        className={
                          index === activeDecisionIndex
                            ? "timeline-action timeline-action-active"
                            : "timeline-action"
                        }
                        type="button"
                        key={decision.actionIndex}
                        onClick={() =>
                          setActiveDecisionIndex(index)
                        }
                      >
      <span className="timeline-index">
        {index + 1}
      </span>

                        <span className="timeline-player">
        {formatStreet(
          decision.street
        )}
      </span>

                        <strong>
                          {formatAction(
                            decision.action
                          )}
                        </strong>

                        <span className="timeline-amount">
        {decision.amount}
      </span>
                      </button>
                    )
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="panel empty-state">
              No decision points found.
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <ReviewApp
      report={sampleReport}
    />
  );
}

export default App;