import {
  useState
} from "react";

import type {
  Card
} from "@poker-vision/poker-engine";

import type {
  HandReview,
  HandReviewDecision,
  HandReviewPlayer
} from "./model/hand-review";

import {
  sampleHandReview
} from "./sample-hand-review";

import "./App.css";

const suitSymbols = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠"
} as const;

function formatAction(
  action: string
): string {
  return (
    action.charAt(0).toUpperCase() +
    action.slice(1)
  );
}

function formatStreet(
  street: string
): string {
  return (
    street.charAt(0).toUpperCase() +
    street.slice(1)
  );
}

function formatGameFormat(
  gameFormat: string
): string {
  return gameFormat
    .split("_")
    .map(formatAction)
    .join(" ");
}

function formatPercentage(
  value: number | undefined
): string {
  if (value === undefined) {
    return "—";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function formatNumber(
  value: number | undefined
): string {
  if (value === undefined) {
    return "—";
  }

  return value.toFixed(2);
}

function formatCard(
  card: Card
): string {
  return `${card.rank}${suitSymbols[card.suit]}`;
}

function CardView({
                    card
                  }: {
  card: Card;
}) {
  const isRed =
    card.suit === "hearts" ||
    card.suit === "diamonds";

  return (
    <span
      className={
        isRed
          ? "card card-red"
          : "card"
      }
    >
      {formatCard(card)}
    </span>
  );
}

function PlayerView({
                      player,
                      placement,
                      showCards
                    }: {
  player: HandReviewPlayer;
  placement: "top" | "bottom";
  showCards: boolean;
}) {
  return (
    <div
      className={
        placement === "top"
          ? "player player-top"
          : "player player-bottom"
      }
    >
      {showCards &&
      player.holeCards !== undefined ? (
        <div className="cards">
          {player.holeCards.map(
            (card, index) => (
              <CardView
                key={`${card.rank}-${card.suit}-${index}`}
                card={card}
              />
            )
          )}
        </div>
      ) : null}

      <span className="player-name">
        {player.name}
      </span>

      <strong>
        {player.startingStack.toLocaleString()}
      </strong>

      <span className="position">
        {player.position}
      </span>
    </div>
  );
}

function DecisionDetails({
                           decision
                         }: {
  decision: HandReviewDecision;
}) {
  return (
    <section className="panel analysis-panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Analysis
          </span>

          <h2>
            Hero decision
          </h2>
        </div>

        <span className="analyzed-badge">
          {decision.status}
        </span>
      </div>

      <div className="decision-action">
        <span>
          Action
        </span>

        <strong>
          {formatAction(
            decision.action
          )}{" "}
          {decision.amount}
        </strong>
      </div>

      <div className="metrics">
        <div className="metric">
          <span>Pot</span>

          <strong>
            {decision.pot}
          </strong>
        </div>

        <div className="metric">
          <span>To call</span>

          <strong>
            {decision.callAmount}
          </strong>
        </div>

        <div className="metric">
          <span>Amount</span>

          <strong>
            {decision.amount}
          </strong>
        </div>

        <div className="metric">
          <span>Street</span>

          <strong>
            {formatStreet(
              decision.street
            )}
          </strong>
        </div>
      </div>

      <div className="analysis-result">
        <span className="panel-label">
          Decision result
        </span>

        <strong>
          {decision.decision !== undefined
            ? formatAction(
              decision.decision
            )
            : "No recommendation"}
        </strong>

        <div className="metrics result-metrics">
          <div className="metric">
            <span>Equity</span>

            <strong>
              {formatPercentage(
                decision.equity
              )}
            </strong>
          </div>

          <div className="metric">
            <span>Pot odds</span>

            <strong>
              {formatPercentage(
                decision.potOdds
              )}
            </strong>
          </div>

          <div className="metric">
            <span>Expected value</span>

            <strong>
              {formatNumber(
                decision.expectedValue
              )}
            </strong>
          </div>

          <div className="metric">
            <span>Status</span>

            <strong>
              {formatAction(
                decision.status
              )}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewApp({
                     review
                   }: {
  review: HandReview;
}) {
  const [
    activeDecisionIndex,
    setActiveDecisionIndex
  ] = useState(0);

  const activeDecision =
    review.decisions[
      activeDecisionIndex
      ];

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

  const activeStreet =
    activeDecision !== undefined
      ? review.streets.find(
        street =>
          street.street ===
          activeDecision.street
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
        <aside className="sidebar">
          <div className="sidebar-header">
            <span>Hands</span>

            <span className="hand-count">
              1
            </span>
          </div>

          <button
            className="hand-item hand-item-active"
            type="button"
          >
            <div className="hand-item-top">
              <strong>
                {review.id}
              </strong>

              <span>
                {formatGameFormat(
                  review.gameFormat
                )}
              </span>
            </div>

            <div className="hand-item-meta">
              {hero !== undefined
                ? `${hero.name} · ${hero.position}`
                : "Unknown hero"}
            </div>

            <div className="hand-item-result">
              {
                review.summary
                  .totalDecisionPoints
              }{" "}
              decision
              {review.summary.totalDecisionPoints === 1
                ? ""
                : "s"}
            </div>
          </button>
        </aside>

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

          {activeDecision !== undefined ? (
            <>
              <div className="review-grid">
                <section className="panel table-panel">
                  <div className="panel-header">
                    <div>
                      <span className="panel-label">
                        Table
                      </span>

                      <h2>
                        {formatStreet(
                          activeDecision.street
                        )}
                      </h2>
                    </div>

                    <span className="pot">
                      Pot {activeDecision.pot}
                    </span>
                  </div>

                  <div className="poker-table">
                    {opponent !== undefined ? (
                      <PlayerView
                        player={opponent}
                        placement="top"
                        showCards={false}
                      />
                    ) : null}

                    <div className="felt">
                      {activeStreet !== undefined &&
                      activeStreet.board.length > 0 ? (
                        <div className="board">
                          {activeStreet.board.map(
                            (card, index) => (
                              <CardView
                                key={`${card.rank}-${card.suit}-${index}`}
                                card={card}
                              />
                            )
                          )}
                        </div>
                      ) : (
                        <div className="board-placeholder">
                          Preflop
                        </div>
                      )}

                      <div className="pot-chip">
                        {activeDecision.pot}
                      </div>
                    </div>

                    {hero !== undefined ? (
                      <PlayerView
                        player={hero}
                        placement="bottom"
                        showCards
                      />
                    ) : null}
                  </div>
                </section>

                <DecisionDetails
                  decision={
                    activeDecision
                  }
                />
              </div>

              <section className="panel timeline-panel">
                <div className="panel-header">
                  <div>
                    <span className="panel-label">
                      Timeline
                    </span>

                    <h2>
                      Decisions
                    </h2>
                  </div>
                </div>

                <div className="timeline">
                  {review.decisions.map(
                    (
                      decision,
                      index
                    ) => (
                      <button
                        className={
                          index === activeDecisionIndex
                            ? "timeline-action timeline-action-active"
                            : "timeline-action"
                        }
                        type="button"
                        key={
                          decision.actionIndex
                        }
                        onClick={() =>
                          setActiveDecisionIndex(
                            index
                          )
                        }
                      >
                        <span className="timeline-index">
                          {index + 1}
                        </span>

                        <span className="timeline-player">
                          {formatStreet(
                            decision.street
                          )}
                        </span>

                        <strong>
                          {formatAction(
                            decision.action
                          )}
                        </strong>

                        <span className="timeline-amount">
                          {decision.amount}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="panel empty-state">
              No decision points found.
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <ReviewApp
      review={sampleHandReview}
    />
  );
}

export default App;