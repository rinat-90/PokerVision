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

        expect(
          events
        ).toEqual([
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

        expect(
          events
        ).toEqual([
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

        expect(
          events
        ).toEqual([
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

        expect(
          events
        ).toEqual([]);
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

        expect(
          events
        ).toEqual([
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

        expect(
          events
        ).toEqual([]);
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

        expect(
          events
        ).toEqual([
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

        expect(
          events
        ).toEqual([]);
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

        expect(
          events
        ).toEqual([]);
      }
    );

  }
);