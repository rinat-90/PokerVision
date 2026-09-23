import type {
  SessionHandResult,
} from "../model/session-results";

import {
  createSessionResultTrend,
} from "../model/session-result-trend";

interface SessionResultTrendProps {
  results: SessionHandResult[];
  activeHandId: string;
  onSelectHand: (
    handId: string,
  ) => void;
}

function formatResult(
  value: number,
): string {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

export function SessionResultTrend({
                                     results,
                                     activeHandId,
                                     onSelectHand,
                                   }: SessionResultTrendProps) {
  const trend =
    createSessionResultTrend(
      results,
    );

  if (trend.points.length === 0) {
    return null;
  }

  if (trend.points.length === 1) {
    const point = trend.points[0];

    return (
      <div className="session-result-trend session-result-trend-single">
        <div className="session-result-trend-header">
          <span>P&amp;L Trend</span>

          <strong>
            {formatResult(
              point.cumulativeNetResult,
            )}
          </strong>
        </div>

        <button
          type="button"
          className="session-result-trend-single-point"
          onClick={() =>
            onSelectHand(
              point.handId,
            )
          }
        >
          <span>
            #{point.handId}
          </span>

          <strong>
            {formatResult(
              point.cumulativeNetResult,
            )}
          </strong>
        </button>
      </div>
    );
  }

  const polylinePoints =
    trend.points
      .map(
        (point) =>
          `${point.x},${point.y}`,
      )
      .join(" ");

  return (
    <div className="session-result-trend">
      <div className="session-result-trend-header">
        <span>P&amp;L Trend</span>

        <strong>
          {formatResult(
            trend.points[
            trend.points.length - 1
              ].cumulativeNetResult,
          )}
        </strong>
      </div>

      <svg
        className="session-result-trend-chart"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        role="img"
        aria-label="Session cumulative profit and loss"
      >
        <line
          className="session-result-trend-zero"
          x1="0"
          x2="100"
          y1={trend.zeroY}
          y2={trend.zeroY}
        />

        <polyline
          className="session-result-trend-line"
          points={polylinePoints}
          fill="none"
        />

        {trend.points.map(
          (point) => {
            const isActive =
              point.handId === activeHandId;

            return (
              <g
                key={point.handId}
                className={[
                  "session-result-trend-point",
                  isActive
                    ? "session-result-trend-point-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                tabIndex={0}
                role="button"
                aria-label={`Hand ${point.handId}, cumulative ${formatResult(
                  point.cumulativeNetResult,
                )}`}
                onClick={() =>
                  onSelectHand(
                    point.handId,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();

                    onSelectHand(
                      point.handId,
                    );
                  }
                }}
              >
                <line
                  className="session-result-trend-point-hit"
                  x1={point.x}
                  x2={point.x}
                  y1={point.y - 6}
                  y2={point.y + 6}
                />

                <line
                  className="session-result-trend-point-marker"
                  x1={point.x}
                  x2={point.x}
                  y1={point.y - 2}
                  y2={point.y + 2}
                />

                <title>
                  {`#${point.handId}: ${formatResult(
                    point.cumulativeNetResult,
                  )}`}
                </title>
              </g>
            );
          },
        )}
      </svg>

      <div className="session-result-trend-range">
        <span>
          {formatResult(
            trend.minValue,
          )}
        </span>

        <span>
          {formatResult(
            trend.maxValue,
          )}
        </span>
      </div>
    </div>
  );
}