import {
  describe,
  expect,
  it
} from "vitest";

import {
  parseBetAmount
} from "./bet-amount-parser.js";

describe(
  "parseBetAmount",
  () => {
    it(
      "parses integer amounts",
      () => {
        expect(
          parseBetAmount("5")
        ).toEqual({
          value: 5,
          rawText: "5",
          confidence: 1
        });
      }
    );

    it(
      "parses decimal amounts",
      () => {
        expect(
          parseBetAmount("5.00")
        ).toEqual({
          value: 5,
          rawText: "5.00",
          confidence: 1
        });
      }
    );

    it(
      "removes currency symbols",
      () => {
        expect(
          parseBetAmount("$5")
        ).toEqual({
          value: 5,
          rawText: "$5",
          confidence: 1
        });
      }
    );

    it(
      "removes thousands separators",
      () => {
        expect(
          parseBetAmount("$1,250")
        ).toEqual({
          value: 1250,
          rawText: "$1,250",
          confidence: 1
        });
      }
    );

    it(
      "trims whitespace",
      () => {
        expect(
          parseBetAmount("  10.5 ")
        ).toEqual({
          value: 10.5,
          rawText: "  10.5 ",
          confidence: 1
        });
      }
    );

    it(
      "rejects empty text",
      () => {
        expect(
          parseBetAmount("")
        ).toEqual({
          value: null,
          rawText: "",
          confidence: 0
        });
      }
    );

    it(
      "rejects non-numeric text",
      () => {
        expect(
          parseBetAmount("abc")
        ).toEqual({
          value: null,
          rawText: "abc",
          confidence: 0
        });

        expect(
          parseBetAmount("5x")
        ).toEqual({
          value: null,
          rawText: "5x",
          confidence: 0
        });
      }
    );
  }
);