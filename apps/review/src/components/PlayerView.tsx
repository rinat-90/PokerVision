import type {
  HandReviewPlayer
} from "@poker-vision/hand-review";

import {
  CardView
} from "./CardView";

export function PlayerView({
                             player,
                             placement,
                             showCards,
                             stack
                           }: {
  player: HandReviewPlayer;
  placement: "top" | "bottom";
  showCards: boolean;
  stack?: number;
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
        {(
          stack ??
          player.startingStack
        ).toLocaleString()}
      </strong>

      <span className="position">
        {player.position}
      </span>
    </div>
  );
}