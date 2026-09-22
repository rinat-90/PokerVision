import {
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
  addHandToSession,
  createReviewSession,
  getSelectedSessionHand,
  selectNextSessionHand,
  selectPreviousSessionHand,
  selectSessionHand,
} from "./model/review-session";

import {
  ReviewApp,
} from "./ReviewApp";

import "./App.css";

function App() {
  const [
    session,
    setSession,
  ] = useState(
    createReviewSession,
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

  const review =
    getSelectedSessionHand(
      session,
    );

  const openHand = () => {
    fileInputRef.current?.click();
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

      {review !== null ? (
        <ReviewApp
          review={review}
          hands={session.hands}
          onOpenHand={openHand}
          onSelectHand={selectHand}
          onPreviousHand={
            selectPreviousHand
          }
          onNextHand={
            selectNextHand
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