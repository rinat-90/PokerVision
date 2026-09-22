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
}

export function HandSwitcher({
                               hands,
                               selectedHandId,
                               onSelectHand,
                               onPreviousHand,
                               onNextHand,
                             }: HandSwitcherProps) {
  if (hands.length <= 1) {
    return null;
  }

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
      <button
        type="button"
        className="secondary-button"
        disabled={!hasPrevious}
        aria-label="Previous hand"
        onClick={onPreviousHand}
      >
        ←
      </button>

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
              <button
                key={hand.id}
                type="button"
                className={
                  isActive
                    ? "hand-switcher-item active"
                    : "hand-switcher-item"
                }
                aria-pressed={isActive}
                onClick={() =>
                  onSelectHand(
                    hand.id,
                  )
                }
              >
                #{hand.id}
              </button>
            );
          },
        )}
      </div>

      <button
        type="button"
        className="secondary-button"
        disabled={!hasNext}
        aria-label="Next hand"
        onClick={onNextHand}
      >
        →
      </button>
    </div>
  );
}