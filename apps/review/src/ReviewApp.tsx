import {
  useEffect,
  useState,
} from "react";

import type {
  KeyboardEvent,
} from "react";

import type {
  HandReview,
} from "@poker-vision/hand-review";

import type {
  ReviewSessionSummary,
} from "./model/review-session-summary";

import {
  ActionTimeline,
} from "./components/ActionTimeline";

import {
  AnalysisPanel,
} from "./components/AnalysisPanel";

import {
  HandSidebar,
} from "./components/HandSidebar";

import {
  HandSwitcher,
} from "./components/HandSwitcher";

import {
  PokerTable,
} from "./components/PokerTable";

import {
  SessionSummary,
} from "./components/SessionSummary";

import type {
  ReviewSessionInsights,
} from "./model/review-session-insights";

import {
  SessionInsights,
} from "./components/SessionInsights";

import type {
  ReviewDecisionQuality,
} from "./model/review-decision-quality";

import {
  DecisionQualitySummary,
} from "./components/DecisionQualitySummary";

import {
  DecisionFilters,
} from "./components/DecisionFilters";

import {
  createDecisionFilter,
  filterDecisions,
} from "./model/decision-filter";

import {
  formatGameFormat,
} from "./utils/format";

interface ReviewAppProps {
  review: HandReview;
  hands: HandReview[];
  sessionSummary: ReviewSessionSummary;
  sessionInsights: ReviewSessionInsights;
  decisionQuality: ReviewDecisionQuality;
  onOpenHand: () => void;
  onSelectHand: (
    handId: string,
  ) => void;
  onPreviousHand: () => void;
  onNextHand: () => void;
  onRemoveHand: (
    handId: string,
  ) => void;
  onClearSession: () => void;
}

export function ReviewApp({
                            review,
                            hands,
                            sessionSummary,
                            sessionInsights,
                            decisionQuality,
                            onOpenHand,
                            onSelectHand,
                            onPreviousHand,
                            onNextHand,
                            onRemoveHand,
                            onClearSession,
                          }: ReviewAppProps) {
  const [
    decisionFilter,
    setDecisionFilter,
  ] = useState(
    createDecisionFilter,
  );

  const allActions =
    review.streets.flatMap(
      (street) =>
        street.actions,
    );

  const filteredDecisions =
    filterDecisions(
      review.decisions,
      decisionFilter,
    );

  const visibleActionIndexes =
    new Set(
      filteredDecisions.map(
        (decision) =>
          decision.actionIndex,
      ),
    );

  const filteredActions =
    allActions.filter(
      (action) =>
        visibleActionIndexes.has(
          action.actionIndex,
        ),
    );

  const streets = Array.from(
    new Set(
      review.decisions.map(
        (decision) =>
          decision.street,
      ),
    ),
  );

  const actions = Array.from(
    new Set(
      review.decisions.map(
        (decision) =>
          decision.action,
      ),
    ),
  );

  const [
    activeActionIndex,
    setActiveActionIndex,
  ] = useState(
    allActions[0]?.actionIndex ?? 0,
  );

  const activeAction =
    allActions.find(
      (action) =>
        action.actionIndex ===
        activeActionIndex,
    );

  const activeDecision =
    review.decisions.find(
      (decision) =>
        decision.actionIndex ===
        activeActionIndex,
    );

  const hero =
    review.players.find(
      (player) =>
        player.holeCards !== undefined,
    ) ??
    review.players[0];

  const opponent =
    review.players.find(
      (player) =>
        player.id !== hero?.id,
    );

  const activeState =
    activeAction?.state;

  const activePlayer =
    activeAction !== undefined
      ? review.players.find(
        (player) =>
          player.id ===
          activeAction.playerId,
      )
      : undefined;

  const activeActionPosition =
    filteredActions.findIndex(
      (action) =>
        action.actionIndex ===
        activeActionIndex,
    );

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.shiftKey) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPreviousHand();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNextHand();
      }

      return;
    }

    if (event.key === "ArrowLeft") {
      const previousAction =
        filteredActions[
        activeActionPosition - 1
          ];

      if (previousAction !== undefined) {
        event.preventDefault();

        setActiveActionIndex(
          previousAction.actionIndex,
        );
      }
    }

    if (event.key === "ArrowRight") {
      const nextAction =
        filteredActions[
        activeActionPosition + 1
          ];

      if (nextAction !== undefined) {
        event.preventDefault();

        setActiveActionIndex(
          nextAction.actionIndex,
        );
      }
    }
  };

  useEffect(() => {
    setActiveActionIndex(
      allActions[0]?.actionIndex ?? 0,
    );
  }, [review.id]);

  useEffect(() => {
    const activeIsVisible =
      filteredActions.some(
        (action) =>
          action.actionIndex ===
          activeActionIndex,
      );

    if (!activeIsVisible) {
      setActiveActionIndex(
        filteredActions[0]
          ?.actionIndex ?? 0,
      );
    }
  }, [
    decisionFilter,
    review.id,
  ]);

  return (
    <div
      className="app"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            PV
          </div>

          <div>
            <div className="brand-name">
              PokerVision
            </div>

            <div className="brand-subtitle">
              Hand Review
            </div>
          </div>
        </div>

        <HandSwitcher
          hands={hands}
          selectedHandId={review.id}
          onSelectHand={onSelectHand}
          onPreviousHand={onPreviousHand}
          onNextHand={onNextHand}
          onRemoveHand={onRemoveHand}
        />

        <div className="topbar-actions">
          <span className="status">
            {
              review.summary
                .analyzedDecisionPoints
            }{" "}
            analyzed
          </span>

          <button
            className="secondary-button"
            type="button"
            onClick={onClearSession}
          >
            Clear session
          </button>

          <button
            className="primary-button"
            type="button"
            onClick={onOpenHand}
          >
            Open hand
          </button>
        </div>
      </header>

      <main className="workspace">
        <HandSidebar
          review={review}
          hero={hero}
        />

        <section className="review">
          <SessionSummary
            summary={sessionSummary}
          />

          <SessionInsights
            insights={sessionInsights}
          />

          <DecisionQualitySummary
            quality={decisionQuality}
          />

          <DecisionFilters
            filter={decisionFilter}
            streets={streets}
            actions={actions}
            onChange={
              setDecisionFilter
            }
          />

          <div className="review-header">
            <div>
              <div className="eyebrow">
                {review.id}
              </div>

              <h1>
                Hand Review
              </h1>

              <p>
                Review reconstructed actions
                and decision analysis.
              </p>
            </div>

            <div className="hand-summary">
              <div>
                <span>Game</span>

                <strong>
                  {formatGameFormat(
                    review.gameFormat,
                  )}
                </strong>
              </div>

              <div>
                <span>Blinds</span>

                <strong>
                  {review.blinds.smallBlind}
                  {" / "}
                  {review.blinds.bigBlind}
                </strong>
              </div>

              <div>
                <span>Hero</span>

                <strong>
                  {hero?.position ?? "—"}
                </strong>
              </div>
            </div>
          </div>

          {activeAction !== undefined ? (
            <>
              <div className="review-grid">
                {activeState !== undefined ? (
                  <PokerTable
                    action={activeAction}
                    state={activeState}
                    hero={hero}
                    opponent={opponent}
                  />
                ) : null}

                <AnalysisPanel
                  decision={activeDecision}
                  playerName={
                    activePlayer?.name ??
                    activeAction.playerId
                  }
                  action={activeAction.type}
                  amount={activeAction.amount}
                />
              </div>

              <ActionTimeline
                review={review}
                activeActionIndex={
                  activeActionIndex
                }
                visibleActionIndexes={
                  visibleActionIndexes
                }
                onSelectAction={
                  setActiveActionIndex
                }
              />
            </>
          ) : (
            <section className="panel empty-state">
              No actions found.
            </section>
          )}
        </section>
      </main>
    </div>
  );
}