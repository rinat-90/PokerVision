import {
  useState,
} from "react";

import type {
  SessionHandResult,
} from "../model/session-results";

import {
  filterSessionResults,
} from "../model/session-result-filter";

import type {
  SessionResultFilter,
} from "../model/session-result-filter";

import {
  SessionResultTrend,
} from "./SessionResultTrend";

interface SessionResultsProps {
  results: SessionHandResult[];
  activeHandId: string;
  onSelectHand: (
    handId: string,
  ) => void;
}

const filters: {
  value: SessionResultFilter;
  label: string;
}[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "wins",
    label: "Wins",
  },
  {
    value: "losses",
    label: "Losses",
  },
];

function formatNetResult(
  value: number,
): string {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

export function SessionResults({
                                 results,
                                 activeHandId,
                                 onSelectHand,
                               }: SessionResultsProps) {
  const [
    filter,
    setFilter,
  ] =
    useState<SessionResultFilter>(
      "all",
    );

  if (results.length === 0) {
    return null;
  }

  const filteredResults =
    filterSessionResults(
      results,
      filter,
    );

  return (
    <section className="session-results">
      <div className="session-results-header">
        <span className="panel-label">
          Session Results
        </span>

        <span>
          {results.length}{" "}
          {results.length === 1
            ? "hand"
            : "hands"}
        </span>
      </div>

      <SessionResultTrend
        results={results}
        activeHandId={activeHandId}
        onSelectHand={onSelectHand}
      />

      <div
        className="session-result-filters"
        aria-label="Session result filters"
      >
        {filters.map(
          (option) => (
            <button
              key={option.value}
              type="button"
              className={[
                "session-result-filter",
                filter ===
                option.value
                  ? "session-result-filter-active"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-pressed={
                filter ===
                option.value
              }
              onClick={() =>
                setFilter(
                  option.value,
                )
              }
            >
              {option.label}
            </button>
          ),
        )}
      </div>

      {filteredResults.length > 0 ? (
        <>
          <div className="session-results-columns">
            <span>Hand</span>
            <span>Net</span>
            <span>Cumulative</span>
          </div>

          <div className="session-results-list">
            {filteredResults.map(
              (result) => (
                <button
                  key={result.handId}
                  type="button"
                  className={[
                    "session-result-item",
                    result.handId ===
                    activeHandId
                      ? "session-result-item-active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    onSelectHand(
                      result.handId,
                    )
                  }
                >
                  <strong>
                    #{result.handId}
                  </strong>

                  <span>
                    {formatNetResult(
                      result.netResult,
                    )}
                  </span>

                  <span>
                    {formatNetResult(
                      result.cumulativeNetResult,
                    )}
                  </span>
                </button>
              ),
            )}
          </div>
        </>
      ) : (
        <div className="session-results-empty">
          No{" "}
          {filter === "wins"
            ? "winning"
            : "losing"}{" "}
          hands
        </div>
      )}
    </section>
  );
}