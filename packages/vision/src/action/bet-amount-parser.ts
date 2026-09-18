export interface BetAmountParseResult {
  value: number | null;
  rawText: string;
  confidence: number;
}

export function parseBetAmount(
  text: string
): BetAmountParseResult {
  const normalized =
    text
      .trim()
      .replace(/\$/g, "")
      .replace(/,/g, "")
      .replace(/\s+/g, "");

  if (!normalized) {
    return {
      value: null,
      rawText: text,
      confidence: 0
    };
  }

  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return {
      value: null,
      rawText: text,
      confidence: 0
    };
  }

  const value =
    Number(normalized);

  if (!Number.isFinite(value)) {
    return {
      value: null,
      rawText: text,
      confidence: 0
    };
  }

  return {
    value,
    rawText: text,
    confidence: 1
  };
}