import type {
  SessionHandResult,
} from "./session-results";

export interface SessionResultTrendPoint {
  handId: string;
  netResult: number;
  cumulativeNetResult: number;
  x: number;
  y: number;
}

export interface SessionResultTrend {
  points: SessionResultTrendPoint[];
  minValue: number;
  maxValue: number;
  zeroY: number;
}

const WIDTH = 100;
const HEIGHT = 100;

export function createSessionResultTrend(
  results: SessionHandResult[],
): SessionResultTrend {
  if (results.length === 0) {
    return {
      points: [],
      minValue: 0,
      maxValue: 0,
      zeroY: HEIGHT / 2,
    };
  }

  const values = [
    0,
    ...results.map(
      (result) =>
        result.cumulativeNetResult,
    ),
  ];

  const minValue =
    Math.min(...values);

  const maxValue =
    Math.max(...values);

  const range =
    maxValue - minValue;

  const getY = (
    value: number,
  ): number => {
    if (range === 0) {
      return HEIGHT / 2;
    }

    return (
      HEIGHT -
      ((value - minValue) / range) *
      HEIGHT
    );
  };

  const denominator =
    Math.max(
      results.length - 1,
      1,
    );

  const points =
    results.map(
      (result, index) => ({
        handId: result.handId,

        netResult:
        result.netResult,

        cumulativeNetResult:
        result.cumulativeNetResult,

        x:
          results.length === 1
            ? WIDTH / 2
            : (index / denominator) *
            WIDTH,

        y: getY(
          result.cumulativeNetResult,
        ),
      }),
    );

  return {
    points,
    minValue,
    maxValue,
    zeroY: getY(0),
  };
}