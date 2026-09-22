import type {
  ReviewSessionSummary,
} from "../model/review-session-summary";

interface SessionSummaryProps {
  summary: ReviewSessionSummary;
}

function formatNetResult(
  value: number,
): string {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

export function SessionSummary({
                                 summary,
                               }: SessionSummaryProps) {
  return (
    <div className="session-summary">
      <div className="session-summary-item">
        <span>Hands</span>
        <strong>
          {summary.totalHands}
        </strong>
      </div>

      <div className="session-summary-item">
        <span>Results</span>
        <strong>
          {summary.completedHands}
          /
          {summary.totalHands}
        </strong>
      </div>

      <div className="session-summary-item">
        <span>Net P&amp;L</span>
        <strong>
          {formatNetResult(
            summary.totalNetResult,
          )}
        </strong>
      </div>

      <div className="session-summary-item">
        <span>Decisions</span>
        <strong>
          {summary.totalDecisionPoints}
        </strong>
      </div>

      <div className="session-summary-item">
        <span>Analyzed</span>
        <strong>
          {summary.analyzedDecisionPoints}
        </strong>
      </div>

      <div className="session-summary-item">
        <span>Skipped</span>
        <strong>
          {summary.skippedDecisionPoints}
        </strong>
      </div>

      <div className="session-summary-item">
        <span>Calls</span>
        <strong>
          {summary.callDecisions}
        </strong>
      </div>
    </div>
  );
}