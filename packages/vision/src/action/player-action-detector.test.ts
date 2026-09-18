import {
  describe,
  expect,
  it
} from "vitest";

import {
  createPlayerContributionState
} from "./player-contribution-state.js";

import {
  PlayerActionDetector
} from "./player-action-detector.js";

describe(
  "PlayerActionDetector",
  () => {
    it(
      "detects bet when there is no previous contribution",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "flop",
                []
              ),

            changes: [
              {
                seatIndex: 4,
                previousAmount: null,
                currentAmount: 600,
                confidence: 0.5
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 4,
            street: "flop",
            type: "bet",
            amount: 600
          }
        ]);
      }
    );

    it(
      "detects call using full contribution snapshot",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "preflop",
                [
                  {
                    seatIndex: 1,
                    amount: 100
                  },
                  {
                    seatIndex: 2,
                    amount: 200
                  },
                  {
                    seatIndex: 4,
                    amount: 600
                  }
                ]
              ),

            changes: [
              {
                seatIndex: 2,
                previousAmount: 200,
                currentAmount: 600,
                confidence: 0.9
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 2,
            street: "preflop",
            type: "call",
            amount: 400
          }
        ]);
      }
    );

    it(
      "detects raise using highest contribution from snapshot",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "preflop",
                [
                  {
                    seatIndex: 1,
                    amount: 100
                  },
                  {
                    seatIndex: 2,
                    amount: 1200
                  },
                  {
                    seatIndex: 4,
                    amount: 600
                  }
                ]
              ),

            changes: [
              {
                seatIndex: 4,
                previousAmount: 600,
                currentAmount: 1900,
                confidence: 0
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 4,
            street: "preflop",
            type: "raise",
            amount: 1300
          }
        ]);
      }
    );

    it(
      "does not emit action when amount clears",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "turn",
                [
                  {
                    seatIndex: 4,
                    amount: 1900
                  }
                ]
              ),

            changes: [
              {
                seatIndex: 4,
                previousAmount: 1900,
                currentAmount: null,
                confidence: 0
              }
            ]
          });

        expect(events).toEqual([]);
      }
    );

    it(
      "uses change previous amount when seat is missing from snapshot",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "preflop",
                [
                  {
                    seatIndex: 2,
                    amount: 1200
                  }
                ]
              ),

            changes: [
              {
                seatIndex: 4,
                previousAmount: 600,
                currentAmount: 1900,
                confidence: 0
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 4,
            street: "preflop",
            type: "raise",
            amount: 1300
          }
        ]);
      }
    );

    it(
      "does not infer action from amount below current highest",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "preflop",
                [
                  {
                    seatIndex: 2,
                    amount: 1200
                  }
                ]
              ),

            changes: [
              {
                seatIndex: 4,
                previousAmount: null,
                currentAmount: 600,
                confidence: 0.5
              }
            ]
          });

        expect(events).toEqual([]);
      }
    );

    it(
      "treats contributions on a new street independently",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "turn",
                []
              ),

            changes: [
              {
                seatIndex: 4,
                previousAmount: null,
                currentAmount: 1900,
                confidence: 0
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 4,
            street: "turn",
            type: "bet",
            amount: 1900
          }
        ]);
      }
    );

    it(
      "does not classify raise from incomplete contribution snapshot",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "preflop",
                [
                  {
                    seatIndex: 2,
                    amount: 200
                  }
                ],
                false
              ),

            changes: [
              {
                seatIndex: 4,
                previousAmount: null,
                currentAmount: 600,
                confidence: 0.36
              }
            ]
          });

        expect(events).toEqual([]);
      }
    );

    it(
      "does not classify call from incomplete contribution snapshot",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "preflop",
                [
                  {
                    seatIndex: 2,
                    amount: 600
                  }
                ],
                false
              ),

            changes: [
              {
                seatIndex: 4,
                previousAmount: null,
                currentAmount: 600,
                confidence: 0.5
              }
            ]
          });

        expect(events).toEqual([]);
      }
    );

    it(
      "emits check from explicit action label",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "flop",
                []
              ),

            changes: [],

            labelEvents: [
              {
                seatIndex: 2,
                label: "check"
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 2,
            street: "flop",
            type: "check",
            amount: null
          }
        ]);
      }
    );

    it(
      "emits fold from explicit action label",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "flop",
                []
              ),

            changes: [],

            labelEvents: [
              {
                seatIndex: 2,
                label: "fold"
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 2,
            street: "flop",
            type: "fold",
            amount: null
          }
        ]);
      }
    );

    it(
      "emits call from explicit action label even when amount is unknown",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "flop",
                [],
                false
              ),

            changes: [],

            labelEvents: [
              {
                seatIndex: 5,
                label: "call"
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 5,
            street: "flop",
            type: "call",
            amount: null
          }
        ]);
      }
    );

    it(
      "does not emit poker action from placeBet label alone",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "flop",
                []
              ),

            changes: [],

            labelEvents: [
              {
                seatIndex: 4,
                label: "placeBet"
              }
            ]
          });

        expect(events).toEqual([]);
      }
    );

    it(
      "does not duplicate call when label and amount identify the same action",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "flop",
                [
                  {
                    seatIndex: 4,
                    amount: 600
                  }
                ]
              ),

            changes: [
              {
                seatIndex: 5,
                previousAmount: null,
                currentAmount: 600,
                confidence: 0.9
              }
            ],

            labelEvents: [
              {
                seatIndex: 5,
                label: "call"
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 5,
            street: "flop",
            type: "call",
            amount: null
          }
        ]);
      }
    );

    it(
      "uses amount context to classify placeBet as bet",
      () => {
        const detector =
          new PlayerActionDetector();

        const events =
          detector.detect({
            contributionState:
              createPlayerContributionState(
                "turn",
                []
              ),

            changes: [
              {
                seatIndex: 4,
                previousAmount: null,
                currentAmount: 5700,
                confidence: 0.23
              }
            ],

            labelEvents: [
              {
                seatIndex: 4,
                label: "placeBet"
              }
            ]
          });

        expect(events).toEqual([
          {
            seatIndex: 4,
            street: "turn",
            type: "bet",
            amount: 5700
          }
        ]);
      }
    );
  }
);