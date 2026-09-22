import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  clearReviewSession,
  loadReviewSession,
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
});