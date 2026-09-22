import type {
  ReviewDecisionQuality,
} from "../model/review-decision-quality";

interface DecisionQualitySummaryProps {
  quality: ReviewDecisionQuality;
}

function formatExpectedValue(
  value: number,
): string {
  const prefix =
    value > 0 ? "+" : "";

  return `${prefix}${value.toFixed(1)}`;
}

export function DecisionQualitySummary({
                                         quality,
                                       }: DecisionQualitySummaryProps) {
  return (
    <section className="decision-quality">
      <div className="decision-quality-item">
        <span>EV decisions</span>

        <strong>
          {quality.analyzedDecisions}
        </strong>
      </div>

      <div className="decision-quality-item">
        <span>+EV</span>

        <strong>
          {quality.positiveEvDecisions}
        </strong>
      </div>

      <div className="decision-quality-item">
        <span>-EV</span>

        <strong>
          {quality.negativeEvDecisions}
        </strong>
      </div>

      <div className="decision-quality-item">
        <span>0 EV</span>

        <strong>
          {quality.neutralEvDecisions}
        </strong>
      </div>

      <div className="decision-quality-item">
        <span>Total EV</span>

        <strong>
          {formatExpectedValue(
            quality.totalExpectedValue,
          )}
        </strong>
      </div>

      <div className="decision-quality-item">
        <span>Average EV</span>

        <strong>
          {quality.averageExpectedValue === null
            ? "—"
            : formatExpectedValue(
              quality.averageExpectedValue,
            )}
        </strong>
      </div>
    </section>
  );
}