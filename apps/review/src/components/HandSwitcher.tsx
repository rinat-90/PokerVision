import type {
  HandReview,
} from "@poker-vision/hand-review";

interface HandSwitcherProps {
  hands: HandReview[];
  selectedHandId: string;
  onSelectHand: (
    handId: string,
  ) => void;
  onPreviousHand: () => void;
  onNextHand: () => void;
  onRemoveHand: (
    handId: string,
  ) => void;
}

export function HandSwitcher({
                               hands,
                               selectedHandId,
                               onSelectHand,
                               onPreviousHand,
                               onNextHand,
                               onRemoveHand,
                             }: HandSwitcherProps) {
  const selectedIndex =
    hands.findIndex(
      (hand) =>
        hand.id === selectedHandId,
    );

  const hasPrevious =
    selectedIndex > 0;

  const hasNext =
    selectedIndex !== -1 &&
    selectedIndex <
    hands.length - 1;

  return (
    <div className="hand-switcher">
      {hands.length > 1 ? (
        <button
          type="button"
          className="secondary-button"
          disabled={!hasPrevious}
          aria-label="Previous hand"
          onClick={onPreviousHand}
        >
          ←
        </button>
      ) : null}

      <span className="hand-switcher-count">
        Hand {selectedIndex + 1} of{" "}
        {hands.length}
      </span>

      <div className="hand-switcher-list">
        {hands.map(
          (hand) => {
            const isActive =
              hand.id === selectedHandId;

            return (
              <div
                key={hand.id}
                className={
                  isActive
                    ? "hand-switcher-entry active"
                    : "hand-switcher-entry"
                }
              >
                <button
                  type="button"
                  className="hand-switcher-item"
                  aria-pressed={isActive}
                  onClick={() =>
                    onSelectHand(
                      hand.id,
                    )
                  }
                >
                  #{hand.id}
                </button>

                <button
                  type="button"
                  className="hand-switcher-remove"
                  aria-label={
                    `Remove hand ${hand.id}`
                  }
                  onClick={() =>
                    onRemoveHand(
                      hand.id,
                    )
                  }
                >
                  ×
                </button>
              </div>
            );
          },
        )}
      </div>

      {hands.length > 1 ? (
        <button
          type="button"
          className="secondary-button"
          disabled={!hasNext}
          aria-label="Next hand"
          onClick={onNextHand}
        >
          →
        </button>
      ) : null}
    </div>
  );
}