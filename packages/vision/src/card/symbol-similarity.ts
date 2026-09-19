import type {
  SymbolMask
} from "./symbol-mask.js";

export function symbolSimilarity(
  first: SymbolMask,
  second: SymbolMask
): number {
  if (
    first.width !==
    second.width ||
    first.height !==
    second.height
  ) {
    return 0;
  }

  if (
    first.data.length === 0
  ) {
    return 1;
  }

  let intersection = 0;
  let union = 0;

  for (
    let index = 0;
    index < first.data.length;
    index += 1
  ) {
    const firstForeground =
      first.data[index] === 1;

    const secondForeground =
      second.data[index] === 1;

    if (
      firstForeground &&
      secondForeground
    ) {
      intersection += 1;
    }

    if (
      firstForeground ||
      secondForeground
    ) {
      union += 1;
    }
  }

  if (union === 0) {
    return 1;
  }

  return (
    intersection /
    union
  );
}