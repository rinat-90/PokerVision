import type {
  HandResult,
} from "../model/hand-result";

import {
  CardView,
} from "./CardView";

interface HandResultSummaryProps {
  result: HandResult;
}

function formatNetResult(
  value: number,
): string {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

export function HandResultSummary({
                                    result,
                                  }: HandResultSummaryProps) {
  return (
    <section className="hand-result-summary">
      <div className="hand-result-header">
        <span className="panel-label">
          Hand Result
        </span>

        <strong>
          Pot {result.finalPot}
        </strong>
      </div>

      <div className="hand-result-content">
        <div className="hand-result-board">
          <span>Board</span>

          <div className="hand-result-cards">
            {result.board.map(
              (card, index) => (
                <CardView
                  key={`${card.rank}-${card.suit}-${index}`}
                  card={card}
                />
              ),
            )}
          </div>
        </div>

        <div className="hand-result-players">
          {result.players.map(
            (player) => (
              <div
                key={player.playerId}
                className={[
                  "hand-result-player",
                  player.isWinner
                    ? "hand-result-player-winner"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="hand-result-player-main">
                  <div className="hand-result-player-name">
                    <strong>
                      {player.name}
                    </strong>

                    {player.isWinner ? (
                      <span>
                        Winner
                      </span>
                    ) : player.cards !== undefined ? (
                      <span>
                        Showdown
                      </span>
                    ) : (
                      <span>
                        No cards shown
                      </span>
                    )}
                  </div>

                  {player.cards !== undefined && (
                    <div className="hand-result-cards">
                      {player.cards.map(
                        (card, index) => (
                          <CardView
                            key={`${card.rank}-${card.suit}-${index}`}
                            card={card}
                          />
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div className="hand-result-player-metrics">
                  <div>
                    <span>Invested</span>

                    <strong>
                      {player.contribution}
                    </strong>
                  </div>

                  <div>
                    <span>Payout</span>

                    <strong>
                      {player.payout}
                    </strong>
                  </div>

                  <div>
                    <span>Net</span>

                    <strong>
                      {formatNetResult(
                        player.netResult,
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}