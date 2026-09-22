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

export function selectPreviousSessionHand(
  session: ReviewSession,
): ReviewSession {
  const currentIndex =
    session.hands.findIndex(
      (hand) =>
        hand.id ===
        session.selectedHandId,
    );

  if (currentIndex <= 0) {
    return session;
  }

  return {
    ...session,
    selectedHandId:
    session.hands[
    currentIndex - 1
      ]!.id,
  };
}

export function selectNextSessionHand(
  session: ReviewSession,
): ReviewSession {
  const currentIndex =
    session.hands.findIndex(
      (hand) =>
        hand.id ===
        session.selectedHandId,
    );

  if (
    currentIndex === -1 ||
    currentIndex >=
    session.hands.length - 1
  ) {
    return session;
  }

  return {
    ...session,
    selectedHandId:
    session.hands[
    currentIndex + 1
      ]!.id,
  };
}

export function removeHandFromSession(
  session: ReviewSession,
  handId: string,
): ReviewSession {
  const index =
    session.hands.findIndex(
      (hand) =>
        hand.id === handId,
    );

  if (index === -1) {
    return session;
  }

  const hands =
    session.hands.filter(
      (hand) =>
        hand.id !== handId,
    );

  if (
    session.selectedHandId !== handId
  ) {
    return {
      ...session,
      hands,
    };
  }

  const nextSelectedHand =
    hands[index] ??
    hands[index - 1] ??
    null;

  return {
    hands,
    selectedHandId:
      nextSelectedHand?.id ?? null,
  };
}