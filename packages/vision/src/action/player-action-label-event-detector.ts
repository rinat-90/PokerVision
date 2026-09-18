import type {
  PlayerActionLabel
} from "./player-action-label-detector.js";

export interface PlayerActionLabelObservation {
  seatIndex: number;
  label: PlayerActionLabel | null;
}

export interface PlayerActionLabelEvent {
  seatIndex: number;
  label: PlayerActionLabel;
}

export class PlayerActionLabelEventDetector {
  private readonly previousLabels =
    new Map<
      number,
      PlayerActionLabel | null
    >();

  update(
    observations:
    PlayerActionLabelObservation[]
  ): PlayerActionLabelEvent[] {
    const events: PlayerActionLabelEvent[] =
      [];

    for (
      const observation
      of observations
      ) {
      const previousLabel =
        this.previousLabels.get(
          observation.seatIndex
        ) ?? null;

      /*
       * Emit only when a semantic label
       * appears or changes.
       *
       * Repeated recognition on subsequent
       * frames is the same visible action.
       */
      if (
        observation.label !== null &&
        observation.label !==
        previousLabel
      ) {
        events.push({
          seatIndex:
          observation.seatIndex,

          label:
          observation.label
        });
      }

      this.previousLabels.set(
        observation.seatIndex,
        observation.label
      );
    }

    return events;
  }
}