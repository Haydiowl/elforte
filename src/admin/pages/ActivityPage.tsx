import { useMemo, useState } from "react";
import AdminTable, { AdminTableEmpty } from "../components/AdminTable";
import { getActivities } from "../../lib/db";

const ACTION_OPTIONS = [
  "login", "logout",
  "property created", "property edited", "property published", "property archived", "property deleted",
  "blog created", "blog edited", "blog published", "blog deleted",
  "client created", "client updated", "inquiry assigned", "inspection created",
  "staff created", "staff suspended", "role changed", "permission changed", "settings changed",
];

const ENTITY_OPTIONS = ["property", "blog", "client", "inquiry", "inspection", "staff", "role", "settings", "auth"];

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  const activities = getActivities().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const users = Array.from(new Set(activities.map((a) => a.userId))).sort();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();
    return activities.filter((a) => {
      const matchesSearch = !q || `${a.action} ${a.entityType} ${a.entityId} ${a.userId}`.toLowerCase().includes(q);
      const matchesUser = userFilter === "All" || a.userId === userFilter;
      const matchesAction = actionFilter === "All" || a.action === actionFilter;
      const matchesEntity = entityFilter === "All" || a.entityType === entityFilter;
      let matchesDate = true;
      if (dateFilter !== "All") {
        const t = new Date(a.timestamp);
        if (dateFilter === "Today") {
          matchesDate = t.toDateString() === now.toDateString();
        } else if (dateFilter === "Last 7 days") {
          matchesDate = now.getTime() - t.getTime() <= 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "Last 30 days") {
          matchesDate = now.getTime() - t.getTime() <= 30 * 24 * 60 * 60 * 1000;
        }
      }
      return matchesSearch && matchesUser && matchesAction && matchesEntity && matchesDate;
    });
  }, [activities, search, userFilter, actionFilter, entityFilter, dateFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-bold text-[#09123c]">Activity Log</h2>
        <p className="mt-1 text-[14px] text-[#6b8aa0]">Read-only record of important admin actions.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9db4c4]"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity…"
            className="w-full rounded-full border border-[#e3e9f0] bg-white py-2.5 pl-9 pr-4 text-[13px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6]"
          />
        </div>

        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="rounded-full border border-[#e3e9f0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6]"
        >
          <option value="All">All Users</option>
          {users.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-full border border-[#e3e9f0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6]"
        >
          <option value="All">All Actions</option>
          {ACTION_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-full border border-[#e3e9f0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6]"
        >
          <option value="All">All Entities</option>
          {ENTITY_OPTIONS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-full border border-[#e3e9f0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6]"
        >
          <option value="All">All Time</option>
          <option value="Today">Today</option>
          <option value="Last 7 days">Last 7 days</option>
          <option value="Last 30 days">Last 30 days</option>
        </select>
      </div>

      <AdminTable
        columns={[
          { key: "user", label: "User" },
          { key: "action", label: "Action" },
          { key: "entity", label: "Entity" },
          { key: "entityId", label: "Entity ID" },
          { key: "time", label: "Time" },
        ]}
      >
        {filtered.length === 0 ? (
          <AdminTableEmpty message="No activity recorded yet." colSpan={5} />
        ) : (
          filtered.map((a) => (
            <tr key={a.id} className="transition-colors hover:bg-[#f8fafc]">
              <td className="px-5 py-4 text-[13px] font-semibold text-[#09123c]">{a.userId}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{a.action}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{a.entityType}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a] font-mono">{a.entityId}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{new Date(a.timestamp).toLocaleString()}</td>
            </tr>
          ))
        )}
      </AdminTable>
    </div>
  );
}
