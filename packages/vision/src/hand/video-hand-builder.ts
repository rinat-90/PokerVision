import type {
  RecognizedBoardEvent
} from "../board/recognized-board-event.js";

import type {
  RecognizedCard
} from "../card/card-recognizer.js";

import type {
  VideoHand,
  VideoHandPlayer
} from "./video-hand.js";

export class VideoHandBuilder {
  private startedAt: number | null = null;
  private completedAt: number | null = null;

  private players: VideoHandPlayer[] = [];
  private board: RecognizedCard[] = [];

  private readonly streets: VideoHand["streets"] = [];

  start(
    timestampSeconds: number,
    players: VideoHandPlayer[]
  ): void {
    this.reset(
      timestampSeconds,
      players
    );
  }

  startPartial(
    players: VideoHandPlayer[]
  ): void {
    this.reset(
      null,
      players
    );
  }

  addBoardEvent(
    timestampSeconds: number,
    event: RecognizedBoardEvent
  ): void {
    switch (event.type) {
      case "flopDealt":
        this.board = [
          ...event.cards
        ];

        this.streets.push({
          street: "flop",
          board: [
            ...this.board
          ],
          timestampSeconds
        });
        break;

      case "turnDealt":
        this.board.push(
          event.card
        );

        this.streets.push({
          street: "turn",
          board: [
            ...this.board
          ],
          timestampSeconds
        });
        break;

      case "riverDealt":
        this.board.push(
          event.card
        );

        this.streets.push({
          street: "river",
          board: [
            ...this.board
          ],
          timestampSeconds
        });
        break;
    }
  }

  complete(
    timestampSeconds: number
  ): VideoHand {
    this.completedAt =
      timestampSeconds;

    return {
      startedAt:
      this.startedAt,
      completedAt:
      this.completedAt,
      players: [
        ...this.players
      ],
      streets:
        this.streets.map(
          (street) => ({
            ...street,
            board: [
              ...street.board
            ]
          })
        )
    };
  }

  private reset(
    startedAt: number | null,
    players: VideoHandPlayer[]
  ): void {
    this.startedAt =
      startedAt;

    this.completedAt =
      null;

    this.players = [
      ...players
    ];

    this.board = [];

    this.streets.length =
      0;
  }
}