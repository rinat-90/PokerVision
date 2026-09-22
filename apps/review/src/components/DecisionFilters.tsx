import type {
  DecisionFilter,
} from "../model/decision-filter";

interface DecisionFiltersProps {
  filter: DecisionFilter;
  streets: string[];
  actions: string[];
  onChange: (
    filter: DecisionFilter,
  ) => void;
}

export function DecisionFilters({
                                  filter,
                                  streets,
                                  actions,
                                  onChange,
                                }: DecisionFiltersProps) {
  return (
    <section className="decision-filters">
      <span className="decision-filters-label">
        Filter decisions
      </span>

      <select
        value={filter.street}
        onChange={(event) =>
          onChange({
            ...filter,
            street:
            event.target.value,
          })
        }
      >
        <option value="all">
          All streets
        </option>

        {streets.map((street) => (
          <option
            key={street}
            value={street}
          >
            {street}
          </option>
        ))}
      </select>

      <select
        value={filter.action}
        onChange={(event) =>
          onChange({
            ...filter,
            action:
            event.target.value,
          })
        }
      >
        <option value="all">
          All actions
        </option>

        {actions.map((action) => (
          <option
            key={action}
            value={action}
          >
            {action}
          </option>
        ))}
      </select>

      <select
        value={filter.status}
        onChange={(event) =>
          onChange({
            ...filter,
            status:
              event.target.value as
                DecisionFilter["status"],
          })
        }
      >
        <option value="all">
          All statuses
        </option>

        <option value="analyzed">
          Analyzed
        </option>

        <option value="skipped">
          Skipped
        </option>
      </select>

      <button
        type="button"
        className="secondary-button"
        disabled={
          filter.street === "all" &&
          filter.action === "all" &&
          filter.status === "all"
        }
        onClick={() =>
          onChange({
            street: "all",
            action: "all",
            status: "all",
          })
        }
      >
        Reset
      </button>
    </section>
  );
}