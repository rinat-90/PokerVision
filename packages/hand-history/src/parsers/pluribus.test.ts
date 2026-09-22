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
    it(
      "parses all-in bet and call actions in Hand #100061",
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
                "PokerStars Hand #100061:"
              )
          );

        expect(
          handText
        ).toBeDefined();

        const hand =
          parsePluribusHand(
            handText ?? ""
          );

        const river =
          hand.streets.find(
            (street) =>
              street.street === "river"
          );

        expect(
          river
        ).toBeDefined();

        expect(
          river?.actions
        ).toEqual([
          {
            playerId: "Pluribus",
            type: "check",
            amount: 0,
            amountType: "contribution",
            street: "river"
          },
          {
            playerId: "MrBlue",
            type: "bet",
            amount: 6825,
            amountType: "contribution",
            street: "river"
          },
          {
            playerId: "Pluribus",
            type: "call",
            amount: 6825,
            amountType: "contribution",
            street: "river"
          }
        ]);
        expect(hand.showdown).toEqual({
          players: [
            {
              playerId: "MrBlue",
              cards: [
                {
                  rank: "5",
                  suit: "diamonds",
                },
                {
                  rank: "5",
                  suit: "clubs",
                },
              ],
            },
            {
              playerId: "Pluribus",
              cards: [
                {
                  rank: "A",
                  suit: "spades",
                },
                {
                  rank: "A",
                  suit: "hearts",
                },
              ],
            },
          ],
          payouts: [
            {
              playerId: "MrBlue",
              amount: 21350,
            },
          ],
        });
      }
    );
  }
);