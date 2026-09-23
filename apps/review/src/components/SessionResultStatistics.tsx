import type {
  SessionResultStatistics as SessionResultStatisticsModel,
} from "../model/session-result-statistics";

interface SessionResultStatisticsProps {
  statistics: SessionResultStatisticsModel;
}

function formatResult(
  value: number | null,
): string {
  if (value === null) {
    return "—";
  }

  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

function formatAverage(
  value: number,
): string {
  const rounded =
    Math.round(value);

  return formatResult(rounded);
}

export function SessionResultStatistics({
                                          statistics,
                                        }: SessionResultStatisticsProps) {
  return (
    <div className="session-result-statistics">
      <div className="session-result-statistic">
        <span>Wins</span>
        <strong>
          {statistics.wins}
        </strong>
      </div>

      <div className="session-result-statistic">
        <span>Losses</span>
        <strong>
          {statistics.losses}
        </strong>
      </div>

      <div className="session-result-statistic">
        <span>Break-even</span>
        <strong>
          {statistics.breakEven}
        </strong>
      </div>

      <div className="session-result-statistic">
        <span>Win rate</span>
        <strong>
          {statistics.winRate.toFixed(
            1,
          )}
          %
        </strong>
      </div>

      <div className="session-result-statistic">
        <span>Average</span>
        <strong>
          {formatAverage(
            statistics.averageResult,
          )}
        </strong>
      </div>

      <div className="session-result-statistic">
        <span>Biggest win</span>
        <strong>
          {formatResult(
            statistics.biggestWin,
          )}
        </strong>
      </div>

      <div className="session-result-statistic">
        <span>Biggest loss</span>
        <strong>
          {formatResult(
            statistics.biggestLoss,
          )}
        </strong>
      </div>
    </div>
  );
}