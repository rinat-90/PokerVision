export type ParsedPlayerActionLabel =
  | "check"
  | "call"
  | "fold"
  | "placeBet";

export function parsePlayerActionLabel(
  text: string
): ParsedPlayerActionLabel | null {
  const normalized =
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");

  if (
    normalized === "check" ||
    normalized === "neck"
  ) {
    return "check";
  }

  if (
    normalized === "call" ||
    normalized === "ca"
  ) {
    return "call";
  }

  if (
    normalized === "fold"
  ) {
    return "fold";
  }

  if (
    normalized === "placebet"
  ) {
    return "placeBet";
  }

  return null;
}