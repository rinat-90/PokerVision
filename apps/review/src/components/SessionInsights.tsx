import type {
  ReviewSessionInsights,
} from "../model/review-session-insights";

interface SessionInsightsProps {
  insights: ReviewSessionInsights;
}

function formatLabel(
  value: string,
): string {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

export function SessionInsights({
                                  insights,
                                }: SessionInsightsProps) {
  const actions =
    Object.entries(
      insights.actions,
    );

  const streets =
    Object.entries(
      insights.streets,
    );

  return (
    <section className="session-insights">
      <div className="session-insights-group">
        <span className="session-insights-label">
          Actions
        </span>

        <div className="session-insights-values">
          {actions.map(
            ([action, count]) => (
              <span
                key={action}
                className="session-insight"
              >
                {formatLabel(action)}
                <strong>{count}</strong>
              </span>
            ),
          )}
        </div>
      </div>

      <div className="session-insights-group">
        <span className="session-insights-label">
          Streets
        </span>

        <div className="session-insights-values">
          {streets.map(
            ([street, count]) => (
              <span
                key={street}
                className="session-insight"
              >
                {formatLabel(street)}
                <strong>{count}</strong>
              </span>
            ),
          )}
        </div>
      </div>
    </section>
  );
}