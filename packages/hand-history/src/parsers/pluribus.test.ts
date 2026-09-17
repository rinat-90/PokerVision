import {
  readFileSync
} from "node:fs";

import {
  resolve
} from "node:path";

import {
  describe,
  expect,
  it
} from "vitest";

import {
  parsePluribusHand
} from "./pluribus.js";

describe(
  "parsePluribusHand",
  () => {
    it(
      "parses Pluribus Hand #100000",
      () => {
        const filePath =
          resolve(
            import.meta.dirname,
            "../../fixtures/pluribus/pluribus_100.txt"
          );

        const input =
          readFileSync(
            filePath,
            "utf8"
          );

        const hands =
          input.split(
            /(?=^PokerStars Hand #)/m
          );

        const handText =
          hands.find(
            (hand) =>
              hand.includes(
                "PokerStars Hand #100000:"
              )
          );

        expect(
          handText
        ).toBeDefined();

        const hand =
          parsePluribusHand(
            handText ?? ""
          );

        expect(
          hand.id
        ).toBe("100000");

        expect(
          hand.players
        ).toHaveLength(6);

        expect(
          hand.streets
        ).toHaveLength(4);
      }
    );
  }
);