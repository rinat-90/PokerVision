import type {
  HandHistory,
  HandHistoryAction
} from "./types.js";

import type {
  PlayerStatus
} from "@poker-vision/poker-engine";

export function derivePlayerStatus(
  playerId: string,
  actions: HandHistoryAction[]
): PlayerStatus {
  let status: PlayerStatus = "active";

  for (const action of actions) {
    if (action.playerId !== playerId) {
      continue;
    }

    if (action.type === "fold") {
      status = "folded";
      continue;
    }

    if (action.type === "all_in") {
      status = "all_in";
    }
  }

  return status;
}