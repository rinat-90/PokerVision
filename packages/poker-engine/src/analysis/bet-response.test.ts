import {
  describe,
  expect,
  it
} from "vitest";

import {
  createBetResponseModel
} from "./bet-response.js";

describe("createBetResponseModel", () => {
  it("creates a response model", () => {
    const result =
      createBetResponseModel({
        foldProbability: 0.3
      });

    expect(result.foldProbability)
      .toBe(0.3);
  });

  it("allows zero fold probability", () => {
    const result =
      createBetResponseModel({
        foldProbability: 0
      });

    expect(result.foldProbability)
      .toBe(0);
  });

  it("allows 100 percent fold probability", () => {
    const result =
      createBetResponseModel({
        foldProbability: 1
      });

    expect(result.foldProbability)
      .toBe(1);
  });

  it("rejects negative fold probability", () => {
    expect(() =>
      createBetResponseModel({
        foldProbability: -0.1
      })
    ).toThrow(
      "Fold probability must be between 0 and 1"
    );
  });

  it("rejects fold probability above 1", () => {
    expect(() =>
      createBetResponseModel({
        foldProbability: 1.1
      })
    ).toThrow(
      "Fold probability must be between 0 and 1"
    );
  });
});