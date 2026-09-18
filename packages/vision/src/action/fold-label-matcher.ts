export function isFoldLabel(
  text: string,
  confidence: number
): boolean {
  if (
    confidence < 0.5
  ) {
    return false;
  }

  const normalized =
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");

  if (
    normalized.length < 3 ||
    normalized.length > 5
  ) {
    return false;
  }

  return (
    levenshteinDistance(
      normalized,
      "fold"
    ) <= 2
  );
}

function levenshteinDistance(
  left: string,
  right: string
): number {
  const previous =
    Array.from(
      {
        length:
          right.length + 1
      },
      (_, index) =>
        index
    );

  for (
    let leftIndex = 1;
    leftIndex <= left.length;
    leftIndex += 1
  ) {
    const current =
      [leftIndex];

    for (
      let rightIndex = 1;
      rightIndex <= right.length;
      rightIndex += 1
    ) {
      const substitutionCost =
        left[
        leftIndex - 1
          ] ===
        right[
        rightIndex - 1
          ]
          ? 0
          : 1;

      current[rightIndex] =
        Math.min(
          (current[rightIndex - 1] ?? 0) + 1,
          (previous[rightIndex] ?? 0) + 1,
          (previous[rightIndex - 1] ?? 0) +
          substitutionCost
        );
    }

    for (
      let index = 0;
      index < current.length;
      index += 1
    ) {
      previous[index] =
        current[index] ?? 0;
    }
  }

  return (
    previous[
      right.length
      ] ?? right.length
  );
}