import {
  describe,
  expect,
  it,
} from "vitest";

import {
  filterSessionResults,
} from "./session-result-filter";

import type {
  SessionHandResult,
} from "./session-results";

const results: SessionHandResult[] = [
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
    netResult: 0,
    cumulativeNetResult: 1000,
  },
  {
    handId: "100004",
    netResult: 1250,
    cumulativeNetResult: 2250,
  },
];

describe("filterSessionResults", () => {
  it("returns all results", () => {
    expect(
      filterSessionResults(
        results,
        "all",
      ),
    ).toEqual(results);
  });

  it("returns only winning hands", () => {
    expect(
      filterSessionResults(
        results,
        "wins",
      ).map(
        (result) =>
          result.handId,
      ),
    ).toEqual([
      "100001",
      "100004",
    ]);
  });

  it("returns only losing hands", () => {
    expect(
      filterSessionResults(
        results,
        "losses",
      ).map(
        (result) =>
          result.handId,
      ),
    ).toEqual([
      "100002",
    ]);
  });

  it("preserves original cumulative results", () => {
    const filtered =
      filterSessionResults(
        results,
        "wins",
      );

    expect(
      filtered.map(
        (result) =>
          result.cumulativeNetResult,
      ),
    ).toEqual([
      1500,
      2250,
    ]);
  });

  it("does not include break-even hands in wins or losses", () => {
    expect(
      filterSessionResults(
        results,
        "wins",
      ).some(
        (result) =>
          result.netResult === 0,
      ),
    ).toBe(false);

    expect(
      filterSessionResults(
        results,
        "losses",
      ).some(
        (result) =>
          result.netResult === 0,
      ),
    ).toBe(false);
  });
});