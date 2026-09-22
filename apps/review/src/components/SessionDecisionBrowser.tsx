import type {
  SessionDecision,
} from "../model/session-decisions";

import {
  formatAction,
  formatStreet,
} from "../utils/format";

interface SessionDecisionBrowserProps {
  decisions: SessionDecision[];
  onSelectDecision: (
    handId: string,
    actionIndex: number,
  ) => void;
}

export function SessionDecisionBrowser({
                                         decisions,
                                         onSelectDecision,
                                       }: SessionDecisionBrowserProps) {
  return (
    <section className="panel session-decision-browser">
      <div className="panel-header">
        <div>
          <span className="panel-label">
            Session
          </span>

          <h2>
            Decision Browser
          </h2>
        </div>

        <span className="status">
          {decisions.length} decisions
        </span>
      </div>

      {decisions.length > 0 ? (
        <div className="session-decision-list">
          {decisions.map(
            ({
               handId,
               decision,
             }) => (
              <button
                key={`${handId}-${decision.actionIndex}`}
                type="button"
                className="session-decision-item"
                onClick={() =>
                  onSelectDecision(
                    handId,
                    decision.actionIndex,
                  )
                }
              >
                <span>
                  #{handId}
                </span>

                <strong>
                  {formatStreet(
                    decision.street,
                  )}
                </strong>

                <strong>
                  {formatAction(
                    decision.action,
                  )}
                </strong>

                <span>
                  {decision.status}
                </span>

                <span>
                  Action{" "}
                  {decision.actionIndex + 1}
                </span>
              </button>
            ),
          )}
        </div>
      ) : (
        <div className="empty-state">
          No matching decisions.
        </div>
      )}
    </section>
  );
}