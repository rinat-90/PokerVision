import type {
  HandReview
} from "../model/hand-review";

import {
  formatAction,
  formatStreet
} from "../utils/format";

import {
  CardView
} from "./CardView";

interface ActionTimelineProps {
  review: HandReview;
  activeActionIndex: number;
  onSelectAction: (
    actionIndex: number
  ) => void;
}

export function ActionTimeline({
                                 review,
                                 activeActionIndex,
                                 onSelectAction
                               }: ActionTimelineProps) {
  const allActions =
    review.streets.flatMap(
      street => street.actions
    );

  const activeActionPosition =
    allActions.findIndex(
      action =>
        action.actionIndex ===
        activeActionIndex
    );

  const hasPreviousAction =
    activeActionPosition > 0;

  const hasNextAction =
    activeActionPosition >= 0 &&
    activeActionPosition <
    allActions.length - 1;

  const selectPreviousAction = () => {
    if (!hasPreviousAction) {
      return;
    }

    const action =
      allActions[
      activeActionPosition - 1
        ];

    if (action !== undefined) {
      onSelectAction(
        action.actionIndex
      );
    }
  };

  const selectNextAction = () => {
    if (!hasNextAction) {
      return;
    }

    const action =
      allActions[
      activeActionPosition + 1
        ];

    if (action !== undefined) {
      onSelectAction(
        action.actionIndex
      );
    }
  };

  return (
    <section className="panel timeline-panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Timeline
          </span>

          <h2>
            Hand actions
          </h2>
        </div>

        <div className="timeline-navigation">
          <button
            type="button"
            className="secondary-button"
            disabled={!hasPreviousAction}
            onClick={selectPreviousAction}
          >
            ← Previous
          </button>

          <span>
            {activeActionPosition + 1}
            {" / "}
            {allActions.length}
          </span>

          <button
            type="button"
            className="secondary-button"
            disabled={!hasNextAction}
            onClick={selectNextAction}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="timeline">
        {review.streets.map(
          street => (
            <div
              className="timeline-street"
              key={street.street}
            >
              <div className="timeline-street-header">
                <strong>
                  {formatStreet(
                    street.street
                  )}
                </strong>

                {street.board.length > 0 ? (
                  <div className="timeline-board">
                    {street.board.map(
                      (card, index) => (
                        <CardView
                          key={`${card.rank}-${card.suit}-${index}`}
                          card={card}
                        />
                      )
                    )}
                  </div>
                ) : null}
              </div>

              <div className="timeline-street-actions">
                {street.actions.map(
                  action => {
                    const player =
                      review.players.find(
                        candidate =>
                          candidate.id ===
                          action.playerId
                      );

                    const decision =
                      review.decisions.find(
                        candidate =>
                          candidate.actionIndex ===
                          action.actionIndex
                      );

                    const isActive =
                      action.actionIndex ===
                      activeActionIndex;

                    return (
                      <button
                        key={
                          action.actionIndex
                        }
                        type="button"
                        className={[
                          "timeline-action",
                          decision !== undefined
                            ? "timeline-action-analyzed"
                            : "",
                          isActive
                            ? "timeline-action-active"
                            : ""
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => {
                          onSelectAction(
                            action.actionIndex
                          );
                        }}
                      >
                        <span className="timeline-index">
                          {action.actionIndex + 1}
                        </span>

                        <span className="timeline-player">
                          {player?.name ??
                            action.playerId}
                        </span>

                        <strong>
                          {formatAction(
                            action.type
                          )}
                        </strong>

                        <span className="timeline-amount">
                          {action.amount > 0
                            ? action.amount
                            : "—"}
                        </span>

                        {decision !== undefined ? (
                          <span className="timeline-analysis-badge">
                            {decision.status}
                          </span>
                        ) : null}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}