import type {
  RecognizedBoardEvent
} from "../board/recognized-board-event.js";

import type {
  RecognizedCard
} from "../card/card-recognizer.js";

import type {
  PlayerActionEvent
} from "../action/player-action-detector.js";

import type {
  VideoHand,
  VideoHandAction,
  VideoHandPlayer
} from "./video-hand.js";

export class VideoHandBuilder {
  private startedAt: number | null = null;
  private completedAt: number | null = null;

  private players: VideoHandPlayer[] = [];
  private board: RecognizedCard[] = [];

  private readonly streets:
    VideoHand["streets"] = [];

  private readonly actions:
    VideoHandAction[] = [];

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

  addAction(
    timestampSeconds: number,
    event: PlayerActionEvent
  ): void {
    this.actions.push({
      seatIndex:
      event.seatIndex,

      street:
      event.street,

      type:
      event.type,

      amount:
      event.amount,

      timestampSeconds
    });
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
          street => ({
            ...street,

            board: [
              ...street.board
            ]
          })
        ),

      actions:
        this.actions.map(
          action => ({
            ...action
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

    this.actions.length =
      0;
  }
}