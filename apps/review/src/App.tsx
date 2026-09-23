import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import {
  loadHandReviews,
} from "./io/load-hand-review";

import {
  loadDecisionReviewState,
  loadReviewSession,
  saveDecisionReviewState,
  saveReviewSession,
} from "./io/review-session-storage";

import {
  addHandToSession,
  createReviewSession,
  getSelectedSessionHand,
  removeHandFromSession,
  selectNextSessionHand,
  selectPreviousSessionHand,
  selectSessionHand,
} from "./model/review-session";

import {
  createReviewSessionSummary,
} from "./model/review-session-summary";

import {
  createReviewSessionInsights,
} from "./model/review-session-insights";

import {
  createReviewDecisionQuality,
} from "./model/review-decision-quality";

import {
  getSessionDecisions,
} from "./model/session-decisions";

import {
  createSessionResults,
} from "./model/session-results";

import type {
  DecisionReviewStateMap,
} from "./model/decision-review-state";

import {
  loadSessionReviewExport,
} from "./io/load-session-review-export";

import {
  ReviewApp,
} from "./ReviewApp";


import "./App.css";

function App() {
  const [
    session,
    setSession,
  ] = useState(
    () =>
      loadReviewSession() ??
      createReviewSession(),
  );

  const [
    decisionReviewState,
    setDecisionReviewState,
  ] = useState<DecisionReviewStateMap>(
    loadDecisionReviewState,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const sessionInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const review =
    getSelectedSessionHand(
      session,
    );

  const sessionSummary =
    createReviewSessionSummary(
      session,
    );

  const sessionInsights =
    createReviewSessionInsights(
      session,
    );

  const decisionQuality =
    createReviewDecisionQuality(
      session,
    );

  const sessionDecisions =
    getSessionDecisions(
      session,
    );

  const sessionResults =
    createSessionResults(
      session,
    );

  useEffect(() => {
    saveReviewSession(
      session,
    );
  }, [session]);

  useEffect(() => {
    saveDecisionReviewState(
      decisionReviewState,
    );
  }, [decisionReviewState]);

  const openHand = () => {
    fileInputRef.current?.click();
  };

  const importSession = () => {
    sessionInputRef.current?.click();
  };

  const handleSessionFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (file === undefined) {
      return;
    }

    try {
      const imported =
        await loadSessionReviewExport(
          file,
        );

      setSession(
        imported.session,
      );

      setDecisionReviewState(
        imported.decisionReviewState,
      );

      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to import session",
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files =
      event.target.files;

    if (
      files === null ||
      files.length === 0
    ) {
      return;
    }

    try {
      const loadedReviews =
        await loadHandReviews(
          files,
        );

      setSession(
        (currentSession) =>
          loadedReviews.reduce(
            (nextSession, loadedReview) =>
              addHandToSession(
                nextSession,
                loadedReview,
              ),
            currentSession,
          ),
      );

      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to open hands",
      );
    } finally {
      event.target.value = "";
    }
  };

  const selectHand = (
    handId: string,
  ) => {
    setSession(
      (currentSession) =>
        selectSessionHand(
          currentSession,
          handId,
        ),
    );
  };

  const selectPreviousHand = () => {
    setSession(
      (currentSession) =>
        selectPreviousSessionHand(
          currentSession,
        ),
    );
  };

  const selectNextHand = () => {
    setSession(
      (currentSession) =>
        selectNextSessionHand(
          currentSession,
        ),
    );
  };

  const removeHand = (
    handId: string,
  ) => {
    setSession(
      (currentSession) =>
        removeHandFromSession(
          currentSession,
          handId,
        ),
    );
  };

  const clearSession = () => {
    setSession(
      createReviewSession(),
    );
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        multiple
        hidden
        onChange={handleFileChange}
      />

      <input
        ref={sessionInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleSessionFileChange}
      />

      {review !== null ? (
        <ReviewApp
          review={review}
          hands={session.hands}
          session={session}
          onImportSession={
            importSession
          }
          sessionSummary={
            sessionSummary
          }
          sessionInsights={
            sessionInsights
          }
          decisionQuality={
            decisionQuality
          }
          sessionDecisions={
            sessionDecisions
          }
          sessionResults={
            sessionResults
          }
          decisionReviewState={
            decisionReviewState
          }
          setDecisionReviewState={
            setDecisionReviewState
          }
          onOpenHand={openHand}
          onSelectHand={selectHand}
          onPreviousHand={
            selectPreviousHand
          }
          onNextHand={
            selectNextHand
          }
          onRemoveHand={
            removeHand
          }
          onClearSession={
            clearSession
          }
        />
      ) : (
        <main className="app-empty">
          <div className="empty-state">
            <div className="brand-mark">
              PV
            </div>

            <h1>
              PokerVision
            </h1>

            <p>
              Open reconstructed hands
              to review their actions and
              decision analysis.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={openHand}
            >
              Open hands
            </button>

            {error !== null ? (
              <p role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </main>
      )}
    </>
  );
}

export default App;