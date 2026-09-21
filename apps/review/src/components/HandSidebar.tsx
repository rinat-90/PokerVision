import type {
  HandReview,
  HandReviewPlayer
} from "@poker-vision/hand-review";

import {
  formatGameFormat
} from "../utils/format";

interface HandSidebarProps {
  review: HandReview;
  hero?: HandReviewPlayer;
}

export function HandSidebar({
                              review,
                              hero
                            }: HandSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Hands</span>

        <span className="hand-count">
          1
        </span>
      </div>

      <button
        className="hand-item hand-item-active"
        type="button"
      >
        <div className="hand-item-top">
          <strong>
            {review.id}
          </strong>

          <span>
            {formatGameFormat(
              review.gameFormat
            )}
          </span>
        </div>

        <div className="hand-item-meta">
          {hero !== undefined
            ? `${hero.name} · ${hero.position}`
            : "Unknown hero"}
        </div>

        <div className="hand-item-result">
          {
            review.summary
              .totalDecisionPoints
          }{" "}
          decision
          {review.summary.totalDecisionPoints === 1
            ? ""
            : "s"}
        </div>
      </button>
    </aside>
  );
}