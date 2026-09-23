import type {
  SessionHandResult,
} from "../model/session-results";

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
  if (results.length === 0) {
    return null;
  }

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

      <div className="session-results-columns">
        <span>Hand</span>
        <span>Net</span>
        <span>Cumulative</span>
      </div>

      <div className="session-results-list">
        {results.map(
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
    </section>
  );
}