import type {
  HandReview,
} from "@poker-vision/hand-review";

interface HandSwitcherProps {
  hands: HandReview[];
  selectedHandId: string;
  onSelectHand: (
    handId: string,
  ) => void;
}

export function HandSwitcher({
                               hands,
                               selectedHandId,
                               onSelectHand,
                             }: HandSwitcherProps) {
  if (hands.length <= 1) {
    return null;
  }

  const selectedIndex =
    hands.findIndex(
      (hand) =>
        hand.id === selectedHandId,
    );

  return (
    <div className="hand-switcher">
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
    </div>
  );
}