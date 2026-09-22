import type {
  HandReviewAction,
  HandReviewDecisionState,
  HandReviewPlayer
} from "@poker-vision/hand-review";

import {
  getDisplayedTableState
} from "../model/displayed-table-state";

import {
  formatStreet
} from "../utils/format";

import {
  CardView
} from "./CardView";

interface PokerTableProps {
  action: HandReviewAction;
  state: HandReviewDecisionState;
  players: HandReviewPlayer[];
  hero?: HandReviewPlayer;
}

const seatClasses = [
  "seat-bottom",
  "seat-bottom-left",
  "seat-top-left",
  "seat-top",
  "seat-top-right",
  "seat-bottom-right"
];

function formatActionType(
  type: HandReviewAction["type"]
): string {
  return type
    .replaceAll("_", " ")
    .toUpperCase();
}

export function PokerTable({
                             action,
                             state,
                             players,
                             hero
                           }: PokerTableProps) {
  const displayedState =
    getDisplayedTableState(
      state,
      action
    );

  const heroIndex =
    hero === undefined
      ? -1
      : players.findIndex(
        player =>
          player.id === hero.id
      );

  const orderedPlayers =
    heroIndex === -1
      ? players
      : [
        ...players.slice(
          heroIndex
        ),
        ...players.slice(
          0,
          heroIndex
        )
      ];

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
          Pot {displayedState.pot}
        </span>
      </div>

      <div className="poker-table">
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
            Pot {displayedState.pot}
          </div>
        </div>

        {orderedPlayers.map(
          (player, index) => {
            const playerState =
              displayedState.players.find(
                candidate =>
                  candidate.id ===
                  player.id
              );

            if (
              playerState ===
              undefined
            ) {
              return null;
            }

            const contribution =
              displayedState
                .playerContributions[
                player.id
                ] ?? 0;

            const isHero =
              player.id === hero?.id;

            const isActing =
              player.id ===
              action.playerId;

            const isFolded =
              playerState.status ===
              "folded";

            const isAllIn =
              playerState.status ===
              "all_in";

            const seatClass =
              seatClasses[
              index %
              seatClasses.length
                ];

            return (
              <div
                key={player.id}
                className={[
                  "table-seat",
                  seatClass,
                  isHero
                    ? "table-seat-hero"
                    : "",
                  isActing
                    ? "table-seat-acting"
                    : "",
                  isFolded
                    ? "table-seat-folded"
                    : "",
                  isAllIn
                    ? "table-seat-all-in"
                    : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {contribution > 0 ? (
                  <div className="table-bet">
                    {contribution}
                  </div>
                ) : null}

                <div className="table-player">
                  <div className="table-player-header">
                    <strong>
                      {player.name}
                    </strong>

                    <span>
                      {player.position}
                    </span>
                  </div>

                  <div className="table-player-stack">
                    Stack{" "}
                    {playerState.stack}
                  </div>

                  {isActing ? (
                    <div className="table-player-action">
                      {formatActionType(
                        action.type
                      )}

                      {action.amount > 0
                        ? ` ${action.amount}`
                        : ""}
                    </div>
                  ) : null}

                  {isFolded ? (
                    <div className="table-player-status">
                      Folded
                    </div>
                  ) : null}

                  {isAllIn ? (
                    <div className="table-player-status">
                      All in
                    </div>
                  ) : null}

                  {isHero &&
                  player.holeCards !==
                  undefined ? (
                    <div className="table-hole-cards">
                      {player.holeCards.map(
                        (
                          card,
                          cardIndex
                        ) => (
                          <CardView
                            key={`${card.rank}-${card.suit}-${cardIndex}`}
                            card={card}
                          />
                        )
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}