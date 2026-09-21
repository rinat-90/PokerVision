import {
  useRef,
  useState
} from "react";

import type {
  ChangeEvent
} from "react";

import type {
  HandReview
} from "@poker-vision/hand-review";

import {
  loadHandReview
} from "./io/load-hand-review";

import {
  ReviewApp
} from "./ReviewApp";

import "./App.css";

function App() {
  const [
    review,
    setReview
  ] = useState<HandReview | null>(
    null
  );

  const [
    error,
    setError
  ] = useState<string | null>(
    null
  );

  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const openHand = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (file === undefined) {
      return;
    }

    try {
      const loadedReview =
        await loadHandReview(file);

      setReview(loadedReview);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to open hand"
      );
    } finally {
      event.target.value = "";
    }
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
          onOpenHand={openHand}
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