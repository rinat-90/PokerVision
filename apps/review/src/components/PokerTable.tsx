import type {
  HandReviewAction,
  HandReviewDecisionState,
  HandReviewPlayer
} from "@poker-vision/hand-review";

import {
  formatStreet
} from "../utils/format";

import {
  CardView
} from "./CardView";

import {
  PlayerView
} from "./PlayerView";

interface PokerTableProps {
  action: HandReviewAction;
  state: HandReviewDecisionState;
  hero?: HandReviewPlayer;
  opponent?: HandReviewPlayer;
}

export function PokerTable({
                             action,
                             state,
                             hero,
                             opponent
                           }: PokerTableProps) {
  const heroState =
    state.players.find(
      player =>
        player.id === hero?.id
    );

  const opponentState =
    state.players.find(
      player =>
        player.id === opponent?.id
    );

  return (
    <section className="panel table-panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Table
          </span>

          <h2>
            {formatStreet(
              state.street ??
              action.street
            )}
          </h2>
        </div>

        <span className="pot">
          Pot {state.pot}
        </span>
      </div>

      <div className="poker-table">
        {opponent !== undefined ? (
          <PlayerView
            player={opponent}
            placement="top"
            showCards={false}
            stack={
              opponentState?.stack
            }
          />
        ) : null}

        <div className="felt">
          {state.board.length > 0 ? (
            <div className="board">
              {state.board.map(
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
            {state.pot}
          </div>
        </div>

        {hero !== undefined ? (
          <PlayerView
            player={hero}
            placement="bottom"
            showCards
            stack={
              heroState?.stack
            }
          />
        ) : null}
      </div>
    </section>
  );
}