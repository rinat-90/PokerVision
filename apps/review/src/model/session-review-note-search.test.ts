import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  SessionReviewNote,
} from "./session-review-notes";

import {
  searchSessionReviewNotes,
} from "./session-review-note-search";

function createNote(
  handId: string,
  actionIndex: number,
  street: string,
  action: string,
  note: string,
): SessionReviewNote {
  return {
    handId,
    decision: {
      actionIndex,
      street,
      action,
    },
    note,
  } as SessionReviewNote;
}

describe(
  "session review note search",
  () => {
    const notes = [
      createNote(
        "100001",
        2,
        "flop",
        "call",
        "Check pot odds",
      ),
      createNote(
        "100002",
        5,
        "turn",
        "bet",
        "Sizing too large",
      ),
      createNote(
        "100003",
        7,
        "river",
        "fold",
        "Possible hero fold",
      ),
    ];

    it("returns all notes for an empty query", () => {
      expect(
        searchSessionReviewNotes(
          notes,
          "",
        ),
      ).toEqual(notes);
    });

    it("searches note text case-insensitively", () => {
      expect(
        searchSessionReviewNotes(
          notes,
          "SIZING",
        ),
      ).toEqual([
        notes[1],
      ]);
    });

    it("searches by hand id", () => {
      expect(
        searchSessionReviewNotes(
          notes,
          "100003",
        ),
      ).toEqual([
        notes[2],
      ]);
    });

    it("searches by street", () => {
      expect(
        searchSessionReviewNotes(
          notes,
          "flop",
        ),
      ).toEqual([
        notes[0],
      ]);
    });

    it("searches by action", () => {
      expect(
        searchSessionReviewNotes(
          notes,
          "fold",
        ),
      ).toEqual([
        notes[2],
      ]);
    });

    it("trims the search query", () => {
      expect(
        searchSessionReviewNotes(
          notes,
          "  pot odds  ",
        ),
      ).toEqual([
        notes[0],
      ]);
    });

    it("returns empty when nothing matches", () => {
      expect(
        searchSessionReviewNotes(
          notes,
          "three-bet",
        ),
      ).toEqual([]);
    });
  },
);