import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createSessionResultTrend,
} from "./session-result-trend";

describe("createSessionResultTrend", () => {
  it("returns an empty trend", () => {
    expect(
      createSessionResultTrend([]),
    ).toEqual({
      points: [],
      minValue: 0,
      maxValue: 0,
      zeroY: 50,
    });
  });

  it("creates cumulative trend points", () => {
    const trend =
      createSessionResultTrend([
        {
          handId: "100001",
          netResult: 1500,
          cumulativeNetResult: 1500,
        },
        {
          handId: "100002",
          netResult: -500,
          cumulativeNetResult: 1000,
        },
        {
          handId: "100003",
          netResult: 1250,
          cumulativeNetResult: 2250,
        },
      ]);

    expect(
      trend.minValue,
    ).toBe(0);

    expect(
      trend.maxValue,
    ).toBe(2250);

    expect(
      trend.zeroY,
    ).toBe(100);

    expect(
      trend.points,
    ).toEqual([
      {
        handId: "100001",
        netResult: 1500,
        cumulativeNetResult: 1500,
        x: 0,
        y: expect.closeTo(
          33.3333333333,
        ),
      },
      {
        handId: "100002",
        netResult: -500,
        cumulativeNetResult: 1000,
        x: 50,
        y: expect.closeTo(
          55.5555555556,
        ),
      },
      {
        handId: "100003",
        netResult: 1250,
        cumulativeNetResult: 2250,
        x: 100,
        y: 0,
      },
    ]);
  });

  it("places zero inside a losing session range", () => {
    const trend =
      createSessionResultTrend([
        {
          handId: "100001",
          netResult: -500,
          cumulativeNetResult: -500,
        },
        {
          handId: "100002",
          netResult: -500,
          cumulativeNetResult: -1000,
        },
      ]);

    expect(
      trend.minValue,
    ).toBe(-1000);

    expect(
      trend.maxValue,
    ).toBe(0);

    expect(
      trend.zeroY,
    ).toBe(0);

    expect(
      trend.points.map(
        (point) => point.y,
      ),
    ).toEqual([
      50,
      100,
    ]);
  });

  it("centers a single zero result", () => {
    const trend =
      createSessionResultTrend([
        {
          handId: "100001",
          netResult: 0,
          cumulativeNetResult: 0,
        },
      ]);

    expect(
      trend.points[0],
    ).toMatchObject({
      x: 50,
      y: 50,
    });

    expect(
      trend.zeroY,
    ).toBe(50);
  });
});