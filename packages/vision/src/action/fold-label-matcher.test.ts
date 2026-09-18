import {
  describe,
  expect,
  it
} from "vitest";

import {
  isFoldLabel
} from "./fold-label-matcher.js";

describe(
  "isFoldLabel",
  () => {
    it(
      "matches Fold",
      () => {
        expect(
          isFoldLabel(
            "Fold",
            0.9
          )
        ).toBe(true);
      }
    );

    it(
      "matches observed Fold OCR",
      () => {
        expect(
          isFoldLabel(
            "rola",
            0.79
          )
        ).toBe(true);
      }
    );

    it(
      "rejects low confidence OCR",
      () => {
        expect(
          isFoldLabel(
            "rola",
            0.2
          )
        ).toBe(false);
      }
    );

    it(
      "rejects unrelated labels",
      () => {
        expect(
          isFoldLabel(
            "check",
            0.9
          )
        ).toBe(false);

        expect(
          isFoldLabel(
            "call",
            0.9
          )
        ).toBe(false);

        expect(
          isFoldLabel(
            "",
            1
          )
        ).toBe(false);
      }
    );
  }
);