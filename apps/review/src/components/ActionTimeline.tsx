import type {
  HandReview,
} from "@poker-vision/hand-review";

import {
  formatAction,
  formatStreet,
} from "../utils/format";

import {
  CardView,
} from "./CardView";

interface ActionTimelineProps {
  review: HandReview;
  activeActionIndex: number;
  showdownSelected?: boolean;
  visibleActionIndexes?: Set<number>;

  onSelectAction: (
    actionIndex: number,
  ) => void;

  onSelectShowdown?: () => void;
}

export function ActionTimeline({
                                 review,
                                 activeActionIndex,
                                 showdownSelected = false,
                                 visibleActionIndexes,
                                 onSelectAction,
                                 onSelectShowdown,
                               }: ActionTimelineProps) {
  const isVisible = (
    actionIndex: number,
  ) =>
    visibleActionIndexes === undefined ||
    visibleActionIndexes.has(
      actionIndex,
    );

  const allActions =
    review.streets
      .flatMap(
        (street) =>
          street.actions,
      )
      .filter(
        (action) =>
          isVisible(
            action.actionIndex,
          ),
      );

  const hasShowdown =
    review.showdown !== undefined;

  const activeActionPosition =
    allActions.findIndex(
      (action) =>
        action.actionIndex ===
        activeActionIndex,
    );

  const hasPreviousAction =
    showdownSelected
      ? allActions.length > 0
      : activeActionPosition > 0;

  const hasNextAction =
    showdownSelected
      ? false
      : activeActionPosition >= 0 &&
      (
        activeActionPosition <
        allActions.length - 1 ||
        hasShowdown
      );

  const totalSteps =
    allActions.length +
    (hasShowdown ? 1 : 0);

  const activeStepPosition =
    showdownSelected
      ? totalSteps
      : activeActionPosition >= 0
        ? activeActionPosition + 1
        : 0;

  const selectPreviousAction = () => {
    if (!hasPreviousAction) {
      return;
    }

    if (showdownSelected) {
      const lastAction =
        allActions.at(-1);

      if (lastAction !== undefined) {
        onSelectAction(
          lastAction.actionIndex,
        );
      }

      return;
    }

    const action =
      allActions[
      activeActionPosition - 1
        ];

    if (action !== undefined) {
      onSelectAction(
        action.actionIndex,
      );
    }
  };

  const selectNextAction = () => {
    if (!hasNextAction) {
      return;
    }

    const nextAction =
      allActions[
      activeActionPosition + 1
        ];

    if (nextAction !== undefined) {
      onSelectAction(
        nextAction.actionIndex,
      );

      return;
    }

    if (
      hasShowdown &&
      onSelectShowdown !== undefined
    ) {
      onSelectShowdown();
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
            {totalSteps === 0
              ? "0 / 0"
              : `${activeStepPosition} / ${totalSteps}`}
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
          (street) => {
            const visibleActions =
              street.actions.filter(
                (action) =>
                  isVisible(
                    action.actionIndex,
                  ),
              );

            if (
              visibleActions.length === 0
            ) {
              return null;
            }

            return (
              <div
                className="timeline-street"
                key={street.street}
              >
                <div className="timeline-street-header">
                  <strong>
                    {formatStreet(
                      street.street,
                    )}
                  </strong>

                  {street.board.length >
                  0 ? (
                    <div className="timeline-board">
                      {street.board.map(
                        (card, index) => (
                          <CardView
                            key={`${card.rank}-${card.suit}-${index}`}
                            card={card}
                          />
                        ),
                      )}
                    </div>
                  ) : null}
                </div>

                <div className="timeline-street-actions">
                  {visibleActions.map(
                    (action) => {
                      const player =
                        review.players.find(
                          (candidate) =>
                            candidate.id ===
                            action.playerId,
                        );

                      const decision =
                        review.decisions.find(
                          (candidate) =>
                            candidate.actionIndex ===
                            action.actionIndex,
                        );

                      const isActive =
                        !showdownSelected &&
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
                            decision !==
                            undefined
                              ? "timeline-action-analyzed"
                              : "",
                            isActive
                              ? "timeline-action-active"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() =>
                            onSelectAction(
                              action.actionIndex,
                            )
                          }
                        >
                          <span className="timeline-index">
                            {action.actionIndex +
                              1}
                          </span>

                          <span className="timeline-player">
                            {player?.name ??
                              action.playerId}
                          </span>

                          <strong>
                            {formatAction(
                              action.type,
                            )}
                          </strong>

                          <span className="timeline-amount">
                            {action.amount > 0
                              ? action.amount
                              : "—"}
                          </span>

                          {decision !==
                          undefined ? (
                            <span className="timeline-analysis-badge">
                              {
                                decision.status
                              }
                            </span>
                          ) : null}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            );
          },
        )}

        {hasShowdown ? (
          <div className="timeline-street">
            <div className="timeline-street-header">
              <strong>
                SHOWDOWN
              </strong>
            </div>

            <div className="timeline-street-actions">
              <button
                type="button"
                className={[
                  "timeline-action",
                  showdownSelected
                    ? "timeline-action-active"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={
                  onSelectShowdown
                }
              >
                <span className="timeline-index">
                  {allActions.length + 1}
                </span>

                <span className="timeline-player">
                  Showdown
                </span>

                <strong>
                  SHOW CARDS
                </strong>

                <span className="timeline-amount">
                  —
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}