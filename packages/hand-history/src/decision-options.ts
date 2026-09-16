import type {
  Player
} from "@poker-vision/poker-engine";

export interface DecisionOptions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  callAmount: number;

  canBet: boolean;
  minimumBet: number;

  canRaise: boolean;
  minimumRaise: number;
}

export function getDecisionOptions(
  player: Player,
  currentBet: number,
  playerContribution: number,
  minimumRaise: number
): DecisionOptions {
  const callAmount = Math.max(
    0,
    currentBet - playerContribution
  );

  const canCheck = callAmount === 0;

  const canCall =
    callAmount > 0 &&
    player.stack > 0;

  const canFold =
    callAmount > 0;

  const canBet =
    currentBet === 0 &&
    player.stack > 0;

  const minimumBet = currentBet === 0
    ? Math.min(player.stack, minimumRaise)
    : 0;

  const canRaise =
    currentBet > 0 &&
    player.stack > callAmount &&
    player.stack >=
    callAmount + minimumRaise;

  const minimumRaiseAmount =
    currentBet + minimumRaise;

  return {
    canFold,
    canCheck,
    canCall,
    callAmount,

    canBet,
    minimumBet,

    canRaise,
    minimumRaise:
    minimumRaiseAmount
  };
}