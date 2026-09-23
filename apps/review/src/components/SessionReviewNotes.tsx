import type {
  SessionReviewNote,
} from "../model/session-review-notes";

import {
  useState,
} from "react";

import {
  searchSessionReviewNotes,
} from "../model/session-review-note-search";

import {
  formatAction,
  formatStreet,
} from "../utils/format";

interface SessionReviewNotesProps {
  notes: SessionReviewNote[];
  onSelectDecision: (
    handId: string,
    actionIndex: number,
  ) => void;
}

export function SessionReviewNotes({
                                     notes,
                                     onSelectDecision,
                                   }: SessionReviewNotesProps) {

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const visibleNotes =
    searchSessionReviewNotes(
      notes,
      searchQuery,
    );

  if (notes.length === 0) {
    return null;
  }

  return (
    <section className="panel session-review-notes">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Review
          </span>

          <h2>Notes</h2>
        </div>

        <span className="status">
          {notes.length}{" "}
          {notes.length === 1
            ? "note"
            : "notes"}
        </span>
      </div>

      <input
        className="session-review-note-search"
        type="search"
        value={searchQuery}
        placeholder="Search notes..."
        aria-label="Search review notes"
        onChange={(event) =>
          setSearchQuery(
            event.target.value,
          )
        }
      />

      <div className="session-review-note-list">
        {visibleNotes.map(
          ({
             handId,
             decision,
             note,
           }) => (
            <button
              key={`${handId}-${decision.actionIndex}`}
              type="button"
              className="session-review-note"
              onClick={() =>
                onSelectDecision(
                  handId,
                  decision.actionIndex,
                )
              }
            >
              <div className="session-review-note-meta">
                <strong>
                  {handId}
                </strong>

                <span>
                  {formatStreet(
                    decision.street,
                  )}
                </span>

                <span>
                  {formatAction(
                    decision.action,
                  )}
                </span>
              </div>

              <p>{note}</p>
            </button>
          ),
        )}
      </div>

      {visibleNotes.length === 0 && (
        <div className="session-review-note-empty">
          No notes match your search.
        </div>
      )}
    </section>
  );
}