import type {
  SessionDecision,
} from "./session-decisions";

export interface DecisionReviewState {
  reviewed: boolean;
  note: string;
}

export type DecisionReviewStateMap =
  Record<string, DecisionReviewState>;

export function createDecisionReviewKey(
  decision: SessionDecision,
): string {
  return `${decision.handId}:${decision.decision.actionIndex}`;
}

export function createDecisionReviewState(): DecisionReviewState {
  return {
    reviewed: false,
    note: "",
  };
}

export function getDecisionReviewState(
  states: DecisionReviewStateMap,
  decision: SessionDecision,
): DecisionReviewState {
  return (
    states[
      createDecisionReviewKey(decision)
      ] ?? createDecisionReviewState()
  );
}

export function updateDecisionReviewed(
  states: DecisionReviewStateMap,
  decision: SessionDecision,
  reviewed: boolean,
): DecisionReviewStateMap {
  const key =
    createDecisionReviewKey(decision);

  const current =
    getDecisionReviewState(
      states,
      decision,
    );

  return {
    ...states,
    [key]: {
      ...current,
      reviewed,
    },
  };
}

export function updateDecisionNote(
  states: DecisionReviewStateMap,
  decision: SessionDecision,
  note: string,
): DecisionReviewStateMap {
  const key =
    createDecisionReviewKey(decision);

  const current =
    getDecisionReviewState(
      states,
      decision,
    );

  return {
    ...states,
    [key]: {
      ...current,
      note,
    },
  };
}