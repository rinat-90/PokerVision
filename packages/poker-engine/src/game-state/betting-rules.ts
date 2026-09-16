import type {
  ActionType,
  HandState,
  Player
} from "./types.js";

export interface ActionValidation {
  valid: boolean;
  error?: string;
}

export function validateAction(
  state: HandState,
  player: Player,
  action: ActionType,
  amount: number
): ActionValidation {
  if (state.currentPlayerId !== player.id) {
    return {
      valid: false,
      error: `It is not ${player.id}'s turn`
    };
  }

  if (player.status !== "active") {
    return {
      valid: false,
      error: `Player ${player.id} is not active`
    };
  }

  if (amount < 0) {
    return {
      valid: false,
      error: "Action amount cannot be negative"
    };
  }

  if (amount > player.stack) {
    return {
      valid: false,
      error: "Player does not have enough chips"
    };
  }

  const contribution =
    state.playerContributions[player.id] ?? 0;

  const amountToCall = Math.max(
    0,
    state.currentBet - contribution
  );

  switch (action) {
    case "fold":
      return {
        valid: true
      };

    case "check":
      if (amountToCall !== 0) {
        return {
          valid: false,
          error: "Cannot check when facing a bet"
        };
      }

      if (amount !== 0) {
        return {
          valid: false,
          error: "Check amount must be zero"
        };
      }

      return {
        valid: true
      };

    case "call":
      if (amountToCall === 0) {
        return {
          valid: false,
          error: "Nothing to call"
        };
      }

      if (amount !== amountToCall) {
        return {
          valid: false,
          error: `Call requires ${amountToCall}`
        };
      }

      return {
        valid: true
      };

    case "bet":
      if (state.currentBet !== 0) {
        return {
          valid: false,
          error: "Cannot bet when a bet already exists"
        };
      }

      if (amount <= 0) {
        return {
          valid: false,
          error: "Bet must be greater than zero"
        };
      }

      if (amount < state.bigBlind) {
        return {
          valid: false,
          error: `Minimum bet is ${state.bigBlind}`
        };
      }

      return {
        valid: true
      };

    case "raise": {
      if (state.currentBet === 0) {
        return {
          valid: false,
          error: "Cannot raise without an existing bet"
        };
      }

      const newContribution =
        contribution + amount;

      const minimumContribution =
        state.currentBet +
        state.minimumRaise;

      if (
        newContribution <
        minimumContribution
      ) {
        return {
          valid: false,
          error:
            `Minimum raise requires total contribution of ` +
            `${minimumContribution}`
        };
      }

      if (amount <= amountToCall) {
        return {
          valid: false,
          error: "Raise must exceed the call amount"
        };
      }

      return {
        valid: true
      };
    }

    case "all_in":
      if (amount !== player.stack) {
        return {
          valid: false,
          error:
            "All-in amount must equal player's remaining stack"
        };
      }

      return {
        valid: true
      };
  }
}