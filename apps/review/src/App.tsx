import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
} from "react";

import {
  loadHandReview,
} from "./io/load-hand-review";

import {
  addHandToSession,
  createReviewSession,
  getSelectedSessionHand,
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
    const file =
      event.target.files?.[0];

    if (file === undefined) {
      return;
    }

    try {
      const loadedReview =
        await loadHandReview(
          file,
        );

      setSession(
        (currentSession) =>
          addHandToSession(
            currentSession,
            loadedReview,
          ),
      );

      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to open hand",
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

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={handleFileChange}
      />

      {review !== null ? (
        <ReviewApp
          review={review}
          hands={session.hands}
          onOpenHand={openHand}
          onSelectHand={selectHand}
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
              Open a reconstructed hand
              to review its actions and
              decision analysis.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={openHand}
            >
              Open hand
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