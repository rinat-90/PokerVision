import type {
  Card
} from "@poker-vision/poker-engine";

import {
  formatCard
} from "../utils/format";

export function CardView({
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