import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  clearDecisionReviewState,
  clearReviewSession,
  loadDecisionReviewState,
  loadReviewSession,
  saveDecisionReviewState,
  saveReviewSession,
} from "./review-session-storage";

import {
  createReviewSession,
} from "../model/review-session";

const storage = new Map<
  string,
  string
>();

beforeEach(() => {
  storage.clear();

  vi.stubGlobal(
    "localStorage",
    {
      getItem: (key: string) =>
        storage.get(key) ?? null,

      setItem: (
        key: string,
        value: string,
      ) => {
        storage.set(key, value);
      },

      removeItem: (
        key: string,
      ) => {
        storage.delete(key);
      },
    },
  );
});

describe("review session storage", () => {
  it("saves and loads a session", () => {
    const session =
      createReviewSession();

    saveReviewSession(session);

    expect(
      loadReviewSession(),
    ).toEqual(session);
  });

  it("returns null when no session exists", () => {
    expect(
      loadReviewSession(),
    ).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    localStorage.setItem(
      "pokervision.review-session",
      "{invalid",
    );

    expect(
      loadReviewSession(),
    ).toBeNull();
  });

  it("clears the stored session", () => {
    saveReviewSession(
      createReviewSession(),
    );

    clearReviewSession();

    expect(
      loadReviewSession(),
    ).toBeNull();
  });
  it(
    "saves and loads decision review state",
    () => {
      const state = {
        "hand-1:4": {
          reviewed: true,
          note: "Loose flop call",
        },
      };

      saveDecisionReviewState(
        state,
      );

      expect(
        loadDecisionReviewState(),
      ).toEqual(state);
    },
  );

  it(
    "returns empty decision review state when none exists",
    () => {
      expect(
        loadDecisionReviewState(),
      ).toEqual({});
    },
  );

  it(
    "returns empty decision review state for invalid JSON",
    () => {
      localStorage.setItem(
        "pokervision.decision-review-state",
        "{invalid",
      );

      expect(
        loadDecisionReviewState(),
      ).toEqual({});
    },
  );

  it(
    "clears decision review state",
    () => {
      saveDecisionReviewState({
        "hand-1:4": {
          reviewed: true,
          note: "Reviewed",
        },
      });

      clearDecisionReviewState();

      expect(
        loadDecisionReviewState(),
      ).toEqual({});
    },
  );
});