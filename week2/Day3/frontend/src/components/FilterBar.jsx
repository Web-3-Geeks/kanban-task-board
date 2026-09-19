const inputClass =
  "rounded-lg border border-white/60 bg-white/70 px-3 py-1.5 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-500";

function FilterBar({ filters, onFilterChange, onClear, sortBy, onSortChange, users }) {
  const hasActiveFilters =
    filters.search || filters.priority || filters.assignedTo || filters.dueFrom || filters.dueTo;

  return (
    <div className="mx-4 mb-2 flex flex-wrap items-center gap-2 rounded-2xl border border-white/40 bg-white/25 p-3 backdrop-blur-xl">
      <input
        type="text"
        value={filters.search}
        onChange={(e) => onFilterChange("search", e.target.value)}
        placeholder="Search title or description..."
        className={`${inputClass} min-w-[180px] flex-1`}
      />

      <select
        value={filters.priority}
        onChange={(e) => onFilterChange("priority", e.target.value)}
        className={inputClass}
      >
        <option value="">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={filters.assignedTo}
        onChange={(e) => onFilterChange("assignedTo", e.target.value)}
        className={inputClass}
      >
        <option value="">Everyone</option>
        <option value="me">Assigned to me</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.dueFrom}
        onChange={(e) => onFilterChange("dueFrom", e.target.value)}
        title="Due from"
        className={inputClass}
      />
      <span className="text-xs text-emerald-900/50">to</span>
      <input
        type="date"
        value={filters.dueTo}
        onChange={(e) => onFilterChange("dueTo", e.target.value)}
        title="Due to"
        className={inputClass}
      />

      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className={inputClass}
      >
        <option value="">Sort: Default</option>
        <option value="dueDate">Sort: Due Date</option>
        <option value="priority">Sort: Priority</option>
        <option value="updated">Sort: Recently Updated</option>
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer rounded-full border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default FilterBar;
