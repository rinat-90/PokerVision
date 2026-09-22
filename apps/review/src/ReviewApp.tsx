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
  formatGameFormat,
} from "./utils/format";

interface ReviewAppProps {
  review: HandReview;
  hands: HandReview[];
  onOpenHand: () => void;
  onSelectHand: (
    handId: string,
  ) => void;
  onPreviousHand: () => void;
  onNextHand: () => void;
}

export function ReviewApp({
                            review,
                            hands,
                            onOpenHand,
                            onSelectHand,
                            onPreviousHand,
                            onNextHand,
                          }: ReviewAppProps) {
  const allActions =
    review.streets.flatMap(
      (street) =>
        street.actions,
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
    allActions.findIndex(
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
        allActions[
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
        allActions[
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