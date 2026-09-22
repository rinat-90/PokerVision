import type {
  HandReview,
} from "@poker-vision/hand-review";

export interface ReviewSession {
  hands: HandReview[];
  selectedHandId: string | null;
}

export function createReviewSession(): ReviewSession {
  return {
    hands: [],
    selectedHandId: null,
  };
}

export function addHandToSession(
  session: ReviewSession,
  hand: HandReview,
): ReviewSession {
  const existingIndex =
    session.hands.findIndex(
      (existing) =>
        existing.id === hand.id,
    );

  const hands =
    existingIndex === -1
      ? [...session.hands, hand]
      : session.hands.map(
        (existing, index) =>
          index === existingIndex
            ? hand
            : existing,
      );

  return {
    hands,
    selectedHandId: hand.id,
  };
}

export function selectSessionHand(
  session: ReviewSession,
  handId: string,
): ReviewSession {
  const exists =
    session.hands.some(
      (hand) => hand.id === handId,
    );

  if (!exists) {
    return session;
  }

  return {
    ...session,
    selectedHandId: handId,
  };
}

export function getSelectedSessionHand(
  session: ReviewSession,
): HandReview | null {
  if (session.selectedHandId === null) {
    return null;
  }

  return (
    session.hands.find(
      (hand) =>
        hand.id === session.selectedHandId,
    ) ?? null
  );
}