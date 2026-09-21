import {
  describe,
  expect,
  it
} from "vitest";

import {
  sampleHandReview
} from "../sample-hand-review";

import {
  loadHandReview
} from "./load-hand-review";

describe("loadHandReview", () => {
  it("loads a serialized hand review", async () => {
    const file =
      new File(
        [
          JSON.stringify(
            sampleHandReview
          )
        ],
        "hand.json",
        {
          type: "application/json"
        }
      );

    const review =
      await loadHandReview(file);

    expect(review).toEqual(
      sampleHandReview
    );
  });

  it("rejects an invalid hand review", async () => {
    const file =
      new File(
        [
          JSON.stringify({
            id: "invalid"
          })
        ],
        "invalid.json",
        {
          type: "application/json"
        }
      );

    await expect(
      loadHandReview(file)
    ).rejects.toThrow(
      "Invalid HandReview file"
    );
  });

  it("rejects invalid JSON", async () => {
    const file =
      new File(
        ["not-json"],
        "invalid.json",
        {
          type: "application/json"
        }
      );

    await expect(
      loadHandReview(file)
    ).rejects.toThrow();
  });
});