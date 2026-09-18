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

  let matches = 0;

  for (
    let index = 0;
    index <
    first.data.length;
    index += 1
  ) {
    if (
      first.data[index] ===
      second.data[index]
    ) {
      matches += 1;
    }
  }

  return (
    matches /
    first.data.length
  );
}