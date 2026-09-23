import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createSessionResultStatistics,
} from "./session-result-statistics";

import type {
  SessionHandResult,
} from "./session-results";

describe(
  "createSessionResultStatistics",
  () => {
    it("returns empty statistics", () => {
      expect(
        createSessionResultStatistics(
          [],
        ),
      ).toEqual({
        totalHands: 0,
        wins: 0,
        losses: 0,
        breakEven: 0,
        winRate: 0,
        averageResult: 0,
        biggestWin: null,
        biggestLoss: null,
      });
    });

    it("calculates session statistics", () => {
      const results: SessionHandResult[] =
        [
          {
            handId: "100001",
            netResult: 1500,
            cumulativeNetResult:
              1500,
          },
          {
            handId: "100002",
            netResult: -500,
            cumulativeNetResult:
              1000,
          },
          {
            handId: "100003",
            netResult: 0,
            cumulativeNetResult:
              1000,
          },
          {
            handId: "100004",
            netResult: 2500,
            cumulativeNetResult:
              3500,
          },
          {
            handId: "100005",
            netResult: -1000,
            cumulativeNetResult:
              2500,
          },
        ];

      expect(
        createSessionResultStatistics(
          results,
        ),
      ).toEqual({
        totalHands: 5,
        wins: 2,
        losses: 2,
        breakEven: 1,
        winRate: 40,
        averageResult: 500,
        biggestWin: 2500,
        biggestLoss: -1000,
      });
    });

    it("handles an all-winning session", () => {
      const statistics =
        createSessionResultStatistics([
          {
            handId: "100001",
            netResult: 500,
            cumulativeNetResult: 500,
          },
          {
            handId: "100002",
            netResult: 1500,
            cumulativeNetResult: 2000,
          },
        ]);

      expect(
        statistics.winRate,
      ).toBe(100);

      expect(
        statistics.biggestWin,
      ).toBe(1500);

      expect(
        statistics.biggestLoss,
      ).toBeNull();
    });

    it("handles an all-losing session", () => {
      const statistics =
        createSessionResultStatistics([
          {
            handId: "100001",
            netResult: -500,
            cumulativeNetResult: -500,
          },
          {
            handId: "100002",
            netResult: -1500,
            cumulativeNetResult: -2000,
          },
        ]);

      expect(
        statistics.winRate,
      ).toBe(0);

      expect(
        statistics.biggestWin,
      ).toBeNull();

      expect(
        statistics.biggestLoss,
      ).toBe(-1500);
    });
  },
);