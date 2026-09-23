import type {
  SessionReviewCompletion as SessionReviewCompletionModel,
} from "../model/session-review-completion";

interface SessionReviewCompletionProps {
  completion: SessionReviewCompletionModel;
  onNextUnreviewed: () => void;
}

export function SessionReviewCompletion({
                                          completion,
                                          onNextUnreviewed,
                                        }: SessionReviewCompletionProps) {
  if (completion.totalDecisions === 0) {
    return null;
  }

  const complete =
    completion.remainingDecisions === 0;

  return (
    <section className="session-review-completion">
      <div className="session-review-completion-header">
        <span className="panel-label">
          Review Progress
        </span>

        <strong>
          {completion.reviewedDecisions}
          {" / "}
          {completion.totalDecisions}
        </strong>
      </div>

      <div
        className="session-review-progress"
        role="progressbar"
        aria-label="Session review progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completion.progress}
      >
        <div
          className="session-review-progress-value"
          style={{
            width: `${completion.progress}%`,
          }}
        />
      </div>

      <div className="session-review-completion-footer">
        <span>
          {complete
            ? "Review complete"
            : `${completion.remainingDecisions} remaining`}
        </span>

        {!complete && (
          <button
            type="button"
            className="secondary-button"
            onClick={onNextUnreviewed}
          >
            Next unreviewed
          </button>
        )}
      </div>
    </section>
  );
}