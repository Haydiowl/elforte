import { useState } from "react";

export type ViewMode = "list" | "grid";

export function useViewMode(page: string, fallback: ViewMode): [ViewMode, (m: ViewMode) => void] {
  const [mode, setModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(`elforte_admin_view_${page}`);
      return saved === "grid" || saved === "list" ? saved : fallback;
    } catch {
      return fallback;
    }
  });

  function setMode(m: ViewMode) {
    setModeState(m);
    try {
      localStorage.setItem(`elforte_admin_view_${page}`, m);
    } catch {
      // storage unavailable — keep in-memory state only
    }
  }

  return [mode, setMode];
}

const listIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><circle cx="3.5" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="3.5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="3.5" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const gridIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export default function ViewSwitcher({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <div className="flex shrink-0 gap-1 rounded-full border border-[#e3e9f0] bg-white p-1" role="group" aria-label="View mode">
      {(["list", "grid"] as ViewMode[]).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
          aria-label={`${m === "list" ? "List" : "Grid"} view`}
          title={m === "list" ? "List view" : "Grid view"}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-[#8ab5d6] ${
            mode === m ? "bg-[#09123c] text-white" : "text-[#6b8aa0] hover:bg-[#f1f5f9] hover:text-[#09123c]"
          }`}
        >
          {m === "list" ? listIcon : gridIcon}
        </button>
      ))}
    </div>
  );
}
