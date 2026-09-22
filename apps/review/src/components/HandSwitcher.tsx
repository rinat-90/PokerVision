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

  return (
    <div className="hand-switcher">
      {hands.map(
        (hand) => (
          <button
            key={hand.id}
            type="button"
            className={
              hand.id === selectedHandId
                ? "hand-switcher-item active"
                : "hand-switcher-item"
            }
            onClick={() =>
              onSelectHand(hand.id)
            }
          >
            #{hand.id}
          </button>
        ),
      )}
    </div>
  );
}