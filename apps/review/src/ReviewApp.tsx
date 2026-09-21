import {
  useState
} from "react";

import type {
  HandReview
} from "./model/hand-review";

import {
  ActionTimeline
} from "./components/ActionTimeline";

import {
  AnalysisPanel
} from "./components/AnalysisPanel";

import {
  HandSidebar
} from "./components/HandSidebar";

import {
  PokerTable
} from "./components/PokerTable";

import {
  formatGameFormat
} from "./utils/format";

interface ReviewAppProps {
  review: HandReview;
}

export function ReviewApp({
                            review
                          }: ReviewAppProps) {
  const allActions =
    review.streets.flatMap(
      street => street.actions
    );

  const [
    activeActionIndex,
    setActiveActionIndex
  ] = useState(
    allActions[0]?.actionIndex ?? 0
  );

  const activeAction =
    allActions.find(
      action =>
        action.actionIndex ===
        activeActionIndex
    );

  const activeDecision =
    review.decisions.find(
      decision =>
        decision.actionIndex ===
        activeActionIndex
    );

  const hero =
    review.players.find(
      player =>
        player.holeCards !== undefined
    ) ??
    review.players[0];

  const opponent =
    review.players.find(
      player =>
        player.id !== hero?.id
    );

  const activeState =
    activeAction?.state;

  const activePlayer =
    activeAction !== undefined
      ? review.players.find(
        player =>
          player.id ===
          activeAction.playerId
      )
      : undefined;

  return (
    <div className="app">
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

        <div className="topbar-actions">
          <span className="status">
            {
              review.summary
                .analyzedDecisionPoints
            }{" "}
            analyzed
          </span>

          <button
            className="primary-button"
            type="button"
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
                    review.gameFormat
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