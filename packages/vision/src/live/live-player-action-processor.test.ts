import {
  describe,
  expect,
  it
} from "vitest";

import type {
  SourceFrame
} from "../source/frame-source.js";

import type {
  TableDetector
} from "../table/table-detector.js";

import type {
  ImageDecoder
} from "../image/image-decoder.js";

import type {
  BetAmountDetection
} from "../action/bet-amount-detector.js";

import type {
  PlayerActionLabelRecognition
} from "../action/player-action-label-recognizer.js";

import type {
  CroppedFrame
} from "../table/crop-frame.js";

import {
  LivePlayerActionProcessor,
  type LiveBetAmountDetector,
  type LiveActionLabelRecognizer
} from "./live-player-action-processor.js";

function frame(
  index: number
): SourceFrame {
  return {
    index,
    width: 1920,
    height: 1080,
    timestampSeconds:
      index * 0.5,

    data:
      Buffer.from([
        index
      ])
  };
}

class FakeTableDetector
  implements TableDetector {
  async detect(
    _frame: SourceFrame
  ) {
    return {
      found: true,
      confidence: 1,

      region: {
        x: 192,
        y: 324,
        width: 1536,
        height: 540
      }
    };
  }
}

class MissingTableDetector
  implements TableDetector {
  async detect(
    _frame: SourceFrame
  ) {
    return {
      found: false,
      confidence: 0,

      region: {
        x: 0,
        y: 0,
        width: 1,
        height: 1
      }
    };
  }
}

class FakeImageDecoder
  implements ImageDecoder {
  async decode(
    _data: Uint8Array
  ) {
    const width = 1920;
    const height = 1080;
    const channels = 3;

    return {
      data:
        new Uint8Array(
          width *
          height *
          channels
        ),

      width,
      height,
      channels
    };
  }
}

type AmountObservation = {
  seatIndex: number;
  amount: number | null;
};

class FakeAmountDetector
  implements LiveBetAmountDetector {
  private frameIndex = 0;
  private seatCalls = 0;

  constructor(
    private readonly frames:
    AmountObservation[][]
  ) {}

  async detect(
    _actionFrame: CroppedFrame,
    _amountFrame: CroppedFrame,
    seatIndex: number
  ): Promise<BetAmountDetection> {
    const observations =
      this.frames[
        this.frameIndex
        ] ?? [];

    const observation =
      observations.find(
        candidate =>
          candidate.seatIndex ===
          seatIndex
      );

    const amount =
      observation?.amount ??
      null;

    const result:
      BetAmountDetection = {
      seatIndex,

      chipPresent:
        amount !== null,

      chipMatchingPixelRatio:
        amount !== null
          ? 0.02
          : 0,

      chipRegion:
        null,

      amount,

      rawText:
        amount !== null
          ? String(amount)
          : null,

      confidence:
        amount !== null
          ? 1
          : 0
    };

    this.seatCalls++;

    if (
      this.seatCalls === 6
    ) {
      this.seatCalls = 0;
      this.frameIndex++;
    }

    return result;
  }
}

type LabelObservation = {
  seatIndex: number;
  label:
    PlayerActionLabelRecognition[
      "label"
      ];
};

class FakeLabelRecognizer
  implements LiveActionLabelRecognizer {
  private frameIndex = 0;
  private seatCalls = 0;

  constructor(
    private readonly frames:
    LabelObservation[][]
  ) {}

  async recognize(
    _frame: CroppedFrame
  ): Promise<PlayerActionLabelRecognition> {
    const seatIndex =
      this.seatCalls;

    const observations =
      this.frames[
        this.frameIndex
        ] ?? [];

    const observation =
      observations.find(
        candidate =>
          candidate.seatIndex ===
          seatIndex
      );

    const label =
      observation?.label ??
      null;

    const result:
      PlayerActionLabelRecognition = {
      label,

      rawText:
        label === null
          ? null
          : label,

      confidence:
        label === null
          ? 0
          : 1,

      matchingPixelRatio:
        label === null
          ? 0
          : 0.02
    };

    this.seatCalls++;

    if (
      this.seatCalls === 6
    ) {
      this.seatCalls = 0;
      this.frameIndex++;
    }

    return result;
  }
}

function emptyLabels(
  count: number
): LabelObservation[][] {
  return Array.from(
    {
      length: count
    },
    () => []
  );
}

describe(
  "LivePlayerActionProcessor",
  () => {
    it(
      "emits explicit player action labels",
      async () => {
        const processor =
          new LivePlayerActionProcessor(
            new FakeTableDetector(),
            new FakeImageDecoder(),
            new FakeAmountDetector([
              []
            ]),
            new FakeLabelRecognizer([
              [
                {
                  seatIndex: 2,
                  label: "check"
                },
                {
                  seatIndex: 5,
                  label: "call"
                }
              ]
            ]),
            {
              contributionStateComplete:
                true
            }
          );

        const result =
          await processor.process(
            frame(0),
            "flop"
          );

        expect(
          result.events
        ).toEqual([
          {
            seatIndex: 2,
            street: "flop",
            type: "check",
            amount: null
          },
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
      "emits a bet only after the amount becomes stable",
      async () => {
        const processor =
          new LivePlayerActionProcessor(
            new FakeTableDetector(),
            new FakeImageDecoder(),
            new FakeAmountDetector([
              [],
              [
                {
                  seatIndex: 4,
                  amount: 1900
                }
              ],
              [
                {
                  seatIndex: 4,
                  amount: 1900
                }
              ]
            ]),
            new FakeLabelRecognizer(
              emptyLabels(3)
            ),
            {
              contributionStateComplete:
                true
            }
          );

        const initial =
          await processor.process(
            frame(0),
            "flop"
          );

        const firstObservation =
          await processor.process(
            frame(1),
            "flop"
          );

        const stable =
          await processor.process(
            frame(2),
            "flop"
          );

        expect(
          initial.events
        ).toEqual([]);

        expect(
          firstObservation.events
        ).toEqual([]);

        expect(
          stable.events
        ).toEqual([
          {
            seatIndex: 4,
            street: "flop",
            type: "bet",
            amount: 1900
          }
        ]);
      }
    );

    it(
      "suppresses amount-derived call when contribution state is incomplete",
      async () => {
        const processor =
          new LivePlayerActionProcessor(
            new FakeTableDetector(),
            new FakeImageDecoder(),
            new FakeAmountDetector([
              [
                {
                  seatIndex: 1,
                  amount: 100
                }
              ],
              [
                {
                  seatIndex: 1,
                  amount: 100
                }
              ],
              [
                {
                  seatIndex: 1,
                  amount: 100
                },
                {
                  seatIndex: 2,
                  amount: 100
                }
              ],
              [
                {
                  seatIndex: 1,
                  amount: 100
                },
                {
                  seatIndex: 2,
                  amount: 100
                }
              ]
            ]),
            new FakeLabelRecognizer(
              emptyLabels(4)
            )
          );

        await processor.process(
          frame(0),
          "preflop"
        );

        await processor.process(
          frame(1),
          "preflop"
        );

        await processor.process(
          frame(2),
          "preflop"
        );

        const result =
          await processor.process(
            frame(3),
            "preflop"
          );

        expect(
          result.events
        ).toEqual([]);
      }
    );

    it(
      "allows amount-derived call after contribution state is marked complete",
      async () => {
        const processor =
          new LivePlayerActionProcessor(
            new FakeTableDetector(),
            new FakeImageDecoder(),
            new FakeAmountDetector([
              [
                {
                  seatIndex: 1,
                  amount: 100
                }
              ],
              [
                {
                  seatIndex: 1,
                  amount: 100
                }
              ],
              [
                {
                  seatIndex: 1,
                  amount: 100
                },
                {
                  seatIndex: 2,
                  amount: 100
                }
              ],
              [
                {
                  seatIndex: 1,
                  amount: 100
                },
                {
                  seatIndex: 2,
                  amount: 100
                }
              ]
            ]),
            new FakeLabelRecognizer(
              emptyLabels(4)
            )
          );

        await processor.process(
          frame(0),
          "preflop"
        );

        await processor.process(
          frame(1),
          "preflop"
        );

        processor
          .markContributionStateComplete();

        await processor.process(
          frame(2),
          "preflop"
        );

        const result =
          await processor.process(
            frame(3),
            "preflop"
          );

        expect(
          result.events
        ).toEqual([
          {
            seatIndex: 2,
            street: "preflop",
            type: "call",
            amount: 100
          }
        ]);
      }
    );

    it(
      "returns no events when the table is not found",
      async () => {
        const processor =
          new LivePlayerActionProcessor(
            new MissingTableDetector(),
            new FakeImageDecoder(),
            new FakeAmountDetector([]),
            new FakeLabelRecognizer([])
          );

        const result =
          await processor.process(
            frame(0),
            "preflop"
          );

        expect(
          result
        ).toEqual({
          timestampSeconds: 0,
          street: "preflop",
          events: []
        });
      }
    );
  }
);