import type {
  HandReview,
} from "@poker-vision/hand-review";

import type {
  SessionDecision,
} from "../model/session-decisions";

import {
  createDecisionComparisonDelta,
} from "../model/decision-comparison-delta";

import {
  getDecisionContext,
} from "../model/decision-context";

import {
  formatAction,
  formatStreet,
} from "../utils/format";

interface DecisionComparisonPanelProps {
  left?: SessionDecision;
  right?: SessionDecision;
  leftReview?: HandReview;
  rightReview?: HandReview;
  onClear: () => void;
}

function formatPercentage(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function formatValue(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  return value.toFixed(1);
}

function formatExpectedValue(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  if (value > 0) {
    return `+${value.toFixed(1)}`;
  }

  return value.toFixed(1);
}

function formatDelta(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  if (value > 0) {
    return `+${value.toFixed(1)}`;
  }

  return value.toFixed(1);
}

function formatPercentageDelta(
  value: number | undefined,
): string {
  if (value === undefined) {
    return "—";
  }

  const percentage =
    value * 100;

  if (percentage > 0) {
    return `+${percentage.toFixed(1)}%`;
  }

  return `${percentage.toFixed(1)}%`;
}

function formatCard(
  card: {
    rank: string;
    suit: string;
  },
): string {
  const suits: Record<string, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };

  return `${card.rank}${suits[card.suit] ?? card.suit}`;
}

function formatCards(
  cards:
    | Array<{
    rank: string;
    suit: string;
  }>
    | undefined,
): string {
  if (
    cards === undefined ||
    cards.length === 0
  ) {
    return "—";
  }

  return cards
    .map(formatCard)
    .join(" ");
}

function ComparisonDecision({
                              label,
                              value,
                              review,
                            }: {
  label: string;
  value?: SessionDecision;
  review?: HandReview;
}) {
  if (value === undefined) {
    return (
      <div className="comparison-decision empty-state">
        Select a decision
      </div>
    );
  }

  const {
    handId,
    decision,
  } = value;

  const context =
    review !== undefined
      ? getDecisionContext(
        value,
        review,
      )
      : undefined;

  const player =
    context?.player;

  const snapshotPlayer =
    decision.state?.players.find(
      (candidate) =>
        candidate.id ===
        context?.playerId,
    );

  return (
    <div className="comparison-decision">
      <div className="comparison-decision-header">
        <span>{label}</span>

        <strong>
          #{handId}
        </strong>
      </div>

      <div className="comparison-metrics">
        <div>
          <span>Player</span>
          <strong>
            {player?.name ?? "—"}
          </strong>
        </div>

        <div>
          <span>Position</span>
          <strong>
            {player?.position ?? "—"}
          </strong>
        </div>

        <div>
          <span>Hole cards</span>
          <strong>
            {formatCards(
              player?.holeCards,
            )}
          </strong>
        </div>

        <div>
          <span>Board</span>
          <strong>
            {formatCards(
              decision.state?.board,
            )}
          </strong>
        </div>

        <div>
          <span>Starting stack</span>
          <strong>
            {formatValue(
              player?.startingStack,
            )}
          </strong>
        </div>

        <div>
          <span>Current stack</span>
          <strong>
            {formatValue(
              snapshotPlayer?.stack,
            )}
          </strong>
        </div>

        <div>
          <span>Current bet</span>
          <strong>
            {formatValue(
              decision.state?.currentBet,
            )}
          </strong>
        </div>

        <div>
          <span>Street</span>
          <strong>
            {formatStreet(
              decision.street,
            )}
          </strong>
        </div>

        <div>
          <span>Action</span>
          <strong>
            {formatAction(
              decision.action,
            )}
          </strong>
        </div>

        <div>
          <span>Pot</span>
          <strong>
            {formatValue(
              decision.pot,
            )}
          </strong>
        </div>

        <div>
          <span>Call</span>
          <strong>
            {formatValue(
              decision.callAmount,
            )}
          </strong>
        </div>

        <div>
          <span>Equity</span>
          <strong>
            {formatPercentage(
              decision.equity,
            )}
          </strong>
        </div>

        <div>
          <span>Pot odds</span>
          <strong>
            {formatPercentage(
              decision.potOdds,
            )}
          </strong>
        </div>

        <div>
          <span>EV</span>
          <strong>
            {formatExpectedValue(
              decision.expectedValue,
            )}
          </strong>
        </div>

        <div>
          <span>Decision</span>
          <strong>
            {decision.decision ?? "—"}
          </strong>
        </div>
      </div>
    </div>
  );
}

export function DecisionComparisonPanel({
                                          left,
                                          right,
                                          leftReview,
                                          rightReview,
                                          onClear,
                                        }: DecisionComparisonPanelProps) {
  if (
    left === undefined &&
    right === undefined
  ) {
    return null;
  }

  const delta =
    left !== undefined &&
    right !== undefined
      ? createDecisionComparisonDelta(
        left,
        right,
      )
      : undefined;

  return (
    <section className="panel decision-comparison-panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Analysis
          </span>

          <h2>
            Decision Comparison
          </h2>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={onClear}
        >
          Clear
        </button>
      </div>

      <div className="decision-comparison-grid">
        <ComparisonDecision
          label="Decision A"
          value={left}
          review={leftReview}
        />

        <ComparisonDecision
          label="Decision B"
          value={right}
          review={rightReview}
        />
      </div>

      {delta !== undefined && (
        <div className="comparison-delta">
          <div className="comparison-delta-header">
            <span className="panel-label">
              Difference
            </span>

            <strong>
              B − A
            </strong>
          </div>

          <div className="comparison-delta-grid">
            <div>
              <span>Pot</span>
              <strong>
                {formatDelta(
                  delta.pot,
                )}
              </strong>
            </div>

            <div>
              <span>Call</span>
              <strong>
                {formatDelta(
                  delta.callAmount,
                )}
              </strong>
            </div>

            <div>
              <span>Equity</span>
              <strong>
                {formatPercentageDelta(
                  delta.equity,
                )}
              </strong>
            </div>

            <div>
              <span>Pot odds</span>
              <strong>
                {formatPercentageDelta(
                  delta.potOdds,
                )}
              </strong>
            </div>

            <div>
              <span>EV</span>
              <strong>
                {formatDelta(
                  delta.expectedValue,
                )}
              </strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}