import {
  describe,
  expect,
  it
} from "vitest";

import {
  createPlayerActionContext
} from "./player-action-context.js";

import {
  PlayerActionClassifier
} from "./player-action-classifier.js";

describe(
  "PlayerActionClassifier",
  () => {
    const classifier =
      new PlayerActionClassifier();

    it(
      "classifies first contribution as bet",
      () => {
        const context =
          createPlayerActionContext({
            seatIndex: 4,
            street: "flop",
            previousAmount: null,
            currentAmount: 600,
            highestAmount: 0,
            chipPresent: true
          });

        expect(
          classifier.classify(context)
        ).toEqual({
          type: "bet",
          amount: 600
        });
      }
    );

    it(
      "classifies matching contribution as call",
      () => {
        const context =
          createPlayerActionContext({
            seatIndex: 2,
            street: "preflop",
            previousAmount: 200,
            currentAmount: 600,
            highestAmount: 600,
            chipPresent: true
          });

        expect(
          classifier.classify(context)
        ).toEqual({
          type: "call",
          amount: 400
        });
      }
    );

    it(
      "classifies larger contribution as raise",
      () => {
        const context =
          createPlayerActionContext({
            seatIndex: 4,
            street: "preflop",
            previousAmount: 600,
            currentAmount: 1900,
            highestAmount: 1200,
            chipPresent: true
          });

        expect(
          classifier.classify(context)
        ).toEqual({
          type: "raise",
          amount: 1300
        });
      }
    );

    it(
      "does not classify amount below highest contribution",
      () => {
        const context =
          createPlayerActionContext({
            seatIndex: 4,
            street: "preflop",
            previousAmount: null,
            currentAmount: 400,
            highestAmount: 600,
            chipPresent: true
          });

        expect(
          classifier.classify(context)
        ).toBeNull();
      }
    );

    it(
      "does not infer action from missing amount",
      () => {
        const context =
          createPlayerActionContext({
            seatIndex: 4,
            street: "turn",
            previousAmount: null,
            currentAmount: null,
            highestAmount: 0,
            chipPresent: false
          });

        expect(
          classifier.classify(context)
        ).toBeNull();
      }
    );

    it(
      "does not emit repeated action for unchanged amount",
      () => {
        const context =
          createPlayerActionContext({
            seatIndex: 4,
            street: "flop",
            previousAmount: 600,
            currentAmount: 600,
            highestAmount: 600,
            chipPresent: true
          });

        expect(
          classifier.classify(context)
        ).toBeNull();
      }
    );
  }
);