import type {
  SessionDecision,
} from "../model/session-decisions";

import type {
  SessionDecisionSort,
} from "../model/session-decision-sort";

import {
  formatAction,
  formatStreet,
} from "../utils/format";

interface SessionDecisionBrowserProps {
  decisions: SessionDecision[];
  activeHandId: string;
  activeActionIndex: number;
  sort: SessionDecisionSort;
  onSortChange: (
    sort: SessionDecisionSort,
  ) => void;
  onSelectDecision: (
    handId: string,
    actionIndex: number,
  ) => void;
}

function formatPercentage(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  return `${(value * 100).toFixed(1)}%`;
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

export function SessionDecisionBrowser({
                                         decisions,
                                         activeHandId,
                                         activeActionIndex,
                                         sort,
                                         onSortChange,
                                         onSelectDecision,
                                       }: SessionDecisionBrowserProps) {
  return (
    <section className="panel session-decision-browser">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Session
          </span>

          <h2>
            Decision Browser
          </h2>
        </div>

        <div className="session-decision-browser-actions">
  <span className="status">
    {decisions.length} decisions
  </span>

          <select
            aria-label="Sort decisions"
            value={sort}
            onChange={(event) =>
              onSortChange(
                event.target
                  .value as SessionDecisionSort,
              )
            }
          >
            <option value="session">
              Session order
            </option>

            <option value="ev-desc">
              EV high → low
            </option>

            <option value="ev-asc">
              EV low → high
            </option>
          </select>
        </div>
      </div>

      {decisions.length > 0 ? (
        <div className="session-decision-list">
          <div className="session-decision-columns">
            <span>Hand</span>
            <span>Street</span>
            <span>Action</span>
            <span>Status</span>
            <span>Equity</span>
            <span>Pot odds</span>
            <span>EV</span>
          </div>

          {decisions.map(
            ({
               handId,
               decision,
             }) => {
              const isActive =
                handId === activeHandId &&
                decision.actionIndex ===
                activeActionIndex;

              return (
                <button
                  key={`${handId}-${decision.actionIndex}`}
                  type="button"
                  className={
                    isActive
                      ? "session-decision-item active"
                      : "session-decision-item"
                  }
                  aria-current={
                    isActive
                      ? "true"
                      : undefined
                  }
                  onClick={() =>
                    onSelectDecision(
                      handId,
                      decision.actionIndex,
                    )
                  }
                >
                  <span>
                    #{handId}
                  </span>

                  <strong>
                    {formatStreet(
                      decision.street,
                    )}
                  </strong>

                  <strong>
                    {formatAction(
                      decision.action,
                    )}
                  </strong>

                  <span>
                    {decision.status}
                  </span>

                  <span>
                    {formatPercentage(
                      decision.equity,
                    )}
                  </span>

                  <span>
                    {formatPercentage(
                      decision.potOdds,
                    )}
                  </span>

                  <span>
                    {formatExpectedValue(
                      decision.expectedValue,
                    )}
                  </span>
                </button>
              );
            },
          )}
        </div>
      ) : (
        <div className="empty-state">
          No matching decisions.
        </div>
      )}
    </section>
  );
}