import type { Filter } from '../types';

interface Props {
  filter: Filter;
  onChange: (filter: Filter) => void;
  activeCount: number;
  todayCount: number;
  hasCompleted: boolean;
  onClearCompleted: () => void;
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export function FilterBar({
  filter,
  onChange,
  activeCount,
  todayCount,
  hasCompleted,
  onClearCompleted,
}: Props) {
  return (
    <footer className="filter-bar">
      <span className="count">
        {activeCount} {activeCount === 1 ? 'task' : 'tasks'} left
      </span>
      <div className="filters" role="group" aria-label="Filter tasks">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            className={filter === value ? 'selected' : ''}
            aria-pressed={filter === value}
            onClick={() => onChange(value)}
          >
            {label}
            {value === 'today' && todayCount > 0 && <span className="badge">{todayCount}</span>}
          </button>
        ))}
      </div>
      <button className="clear" onClick={onClearCompleted} disabled={!hasCompleted}>
        Clear completed
      </button>
    </footer>
  );
}
