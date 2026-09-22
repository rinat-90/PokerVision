import type {
  HandReview,
  HandReviewPlayer
} from "@poker-vision/hand-review";

import {
  getShowdownTableState
} from "../model/showdown-table-state";

import {
  CardView
} from "./CardView";

interface ShowdownTableProps {
  review: HandReview;
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

export function ShowdownTable({
                                review,
                                hero
                              }: ShowdownTableProps) {
  const state =
    getShowdownTableState(review);

  const showdown =
    review.showdown;

  if (
    state === undefined ||
    showdown === undefined
  ) {
    return null;
  }

  const heroIndex =
    hero === undefined
      ? -1
      : review.players.findIndex(
        player =>
          player.id === hero.id
      );

  const orderedPlayers =
    heroIndex === -1
      ? review.players
      : [
        ...review.players.slice(
          heroIndex
        ),
        ...review.players.slice(
          0,
          heroIndex
        )
      ];

  const river =
    review.streets.find(
      street =>
        street.street === "river"
    );

  const board =
    river?.board ??
    review.streets.at(-1)?.board ??
    [];

  return (
    <section className="panel table-panel">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Table
          </span>

          <h2>
            SHOWDOWN
          </h2>
        </div>

        <span className="pot">
          Pot {state.pot}
        </span>
      </div>

      <div className="poker-table">
        <div className="felt">
          {board.length > 0 ? (
            <div className="board">
              {board.map(
                (card, index) => (
                  <CardView
                    key={`${card.rank}-${card.suit}-${index}`}
                    card={card}
                  />
                )
              )}
            </div>
          ) : null}

          <div className="pot-chip">
            Pot {state.pot}
          </div>
        </div>

        {orderedPlayers.map(
          (player, index) => {
            const playerState =
              state.players.find(
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

            const shownPlayer =
              showdown.players.find(
                candidate =>
                  candidate.playerId ===
                  player.id
              );

            const payout =
              showdown.payouts.find(
                candidate =>
                  candidate.playerId ===
                  player.id
              );

            const contribution =
              state.playerContributions[
                player.id
                ] ?? 0;

            const isHero =
              player.id === hero?.id;

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

                  {shownPlayer !==
                  undefined ? (
                    <div className="table-hole-cards">
                      {shownPlayer.cards.map(
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

                  {payout !== undefined ? (
                    <div className="table-player-winner">
                      Winner +{payout.amount}
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