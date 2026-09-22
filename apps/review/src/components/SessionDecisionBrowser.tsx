import type {
  KeyboardEvent,
} from "react";

import type {
  SessionDecision,
} from "../model/session-decisions";

import type {
  SessionDecisionSort,
} from "../model/session-decision-sort";

import type {
  DecisionEvBucket,
  DecisionEvSummary,
} from "../model/session-decision-ev";

import type {
  DecisionReviewStateMap,
} from "../model/decision-review-state";

import {
  getDecisionReviewState,
} from "../model/decision-review-state";

import {
  formatAction,
  formatStreet,
} from "../utils/format";

interface SessionDecisionBrowserProps {
  decisions: SessionDecision[];
  activeHandId: string;
  activeActionIndex: number;
  sort: SessionDecisionSort;
  evSummary: DecisionEvSummary;
  evBucket: DecisionEvBucket;
  comparisonActionIndexes: Set<string>;
  decisionReviewState: DecisionReviewStateMap;
  onEvBucketChange: (
    bucket: DecisionEvBucket,
  ) => void;
  onSortChange: (
    sort: SessionDecisionSort,
  ) => void;
  onSelectDecision: (
    handId: string,
    actionIndex: number,
  ) => void;
  onToggleComparison: (
    decision: SessionDecision,
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
                                         evSummary,
                                         evBucket,
                                         comparisonActionIndexes,
                                         onEvBucketChange,
                                         onSortChange,
                                         onSelectDecision,
                                         onToggleComparison,
                                         decisionReviewState,
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

      <div className="decision-ev-filters">
        <button
          type="button"
          className={
            evBucket === "all"
              ? "active"
              : undefined
          }
          onClick={() =>
            onEvBucketChange("all")
          }
        >
          All {evSummary.all}
        </button>

        <button
          type="button"
          className={
            evBucket === "positive"
              ? "active"
              : undefined
          }
          onClick={() =>
            onEvBucketChange("positive")
          }
        >
          +EV {evSummary.positive}
        </button>

        <button
          type="button"
          className={
            evBucket === "neutral"
              ? "active"
              : undefined
          }
          onClick={() =>
            onEvBucketChange("neutral")
          }
        >
          0 EV {evSummary.neutral}
        </button>

        <button
          type="button"
          className={
            evBucket === "negative"
              ? "active"
              : undefined
          }
          onClick={() =>
            onEvBucketChange("negative")
          }
        >
          -EV {evSummary.negative}
        </button>

        <button
          type="button"
          className={
            evBucket === "unavailable"
              ? "active"
              : undefined
          }
          onClick={() =>
            onEvBucketChange(
              "unavailable",
            )
          }
        >
          No EV {evSummary.unavailable}
        </button>
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
            <span>Review</span>
            <span>Compare</span>
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

              const comparisonKey =
                `${handId}-${decision.actionIndex}`;

              const isCompared =
                comparisonActionIndexes.has(
                  comparisonKey,
                );

              const reviewState =
                getDecisionReviewState(
                  decisionReviewState,
                  {
                    handId,
                    decision,
                  },
                );

              const selectDecision = () => {
                onSelectDecision(
                  handId,
                  decision.actionIndex,
                );
              };

              const handleKeyDown = (
                event: KeyboardEvent<HTMLDivElement>,
              ) => {
                if (
                  event.key !== "Enter" &&
                  event.key !== " "
                ) {
                  return;
                }

                event.preventDefault();

                selectDecision();
              };

              return (
                <div
                  key={comparisonKey}
                  className={
                    isActive
                      ? "session-decision-item active"
                      : "session-decision-item"
                  }
                  role="button"
                  tabIndex={0}
                  aria-current={
                    isActive
                      ? "true"
                      : undefined
                  }
                  onClick={selectDecision}
                  onKeyDown={
                    handleKeyDown
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

                  <span
                    className={
                      reviewState.reviewed
                        ? "decision-review-status reviewed"
                        : "decision-review-status"
                    }
                  >
  {reviewState.reviewed
    ? "✓ Reviewed"
    : "—"}
</span>

                  <button
                    type="button"
                    className={
                      isCompared
                        ? "comparison-toggle active"
                        : "comparison-toggle"
                    }
                    aria-pressed={
                      isCompared
                    }
                    onClick={(event) => {
                      event.stopPropagation();

                      onToggleComparison({
                        handId,
                        decision,
                      });
                    }}
                  >
                    {isCompared
                      ? "Selected"
                      : "Compare"}
                  </button>
                </div>
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