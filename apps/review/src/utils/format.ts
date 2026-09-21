import type {
  Card
} from "@poker-vision/poker-engine";

const suitSymbols = {
  clubs: "♣",
  diamonds: "♦",
  hearts: "♥",
  spades: "♠"
} as const;

export function formatAction(
  action: string
): string {
  return (
    action.charAt(0).toUpperCase() +
    action.slice(1)
  );
}

export function formatStreet(
  street: string
): string {
  return (
    street.charAt(0).toUpperCase() +
    street.slice(1)
  );
}

export function formatGameFormat(
  gameFormat: string
): string {
  return gameFormat
    .split("_")
    .map(formatAction)
    .join(" ");
}

export function formatPercentage(
  value: number | undefined
): string {
  if (value === undefined) {
    return "—";
  }

  return `${(value * 100).toFixed(1)}%`;
}

export function formatNumber(
  value: number | undefined
): string {
  if (value === undefined) {
    return "—";
  }

  return value.toFixed(2);
}

export function formatCard(
  card: Card
): string {
  return `${card.rank}${suitSymbols[card.suit]}`;
}