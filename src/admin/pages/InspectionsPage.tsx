import { useState } from "react";
import AdminTable, { AdminTableEmpty } from "../components/AdminTable";
import { getInspections, createInspection, updateInspection, deleteInspection, getClient, getProperty, getClients, getProperties, getStaff } from "../../lib/db";
import type { Inspection } from "../../lib/types";

const STATUSES: Inspection["status"][] = ["Scheduled", "Confirmed", "Completed", "Rescheduled", "Cancelled"];
const OUTCOMES: Inspection["outcome"][] = ["Interested", "Follow-up Required", "Not Interested", "Purchased"];
const PAGE_SIZE = 8;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function toDateKey(value: string | null | undefined): string {
  if (!value) return "";
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return value.slice(0, 10);
}

function parseLocalDate(key: string): Date {
  const parts = key.split("-").map(Number);
  return new Date(parts[0] || 1970, (parts[1] || 1) - 1, parts[2] || 1);
}

function formatLongDate(key: string): string {
  try {
    return parseLocalDate(key).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return key;
  }
}

function todayKey(): string {
  const t = new Date();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}-${mm}-${dd}`;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

function statusColor(status: string): string {
  switch (status) {
    case "Scheduled":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Confirmed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Completed":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "Rescheduled":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Cancelled":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export default function InspectionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Inspection | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    clientId: "",
    propertyId: "",
    date: "",
    time: "",
    assignedStaffId: "",
    status: "Scheduled" as Inspection["status"],
    notes: "",
    outcome: null as Inspection["outcome"],
  });
  const today = todayKey();
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(today);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);

  const allInspections = getInspections();
  const clients = getClients();
  const properties = getProperties();

  const filtered = allInspections
    .filter((i) => {
      const q = search.trim().toLowerCase();
      const client = i.clientId ? getClient(i.clientId) : null;
      const property = i.propertyId ? getProperty(i.propertyId) : null;
      const matchesSearch = !q || `${client?.name ?? ""} ${property?.name ?? ""} ${i.notes}`.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Calendar grouping — derived from the same records as the list view.
  // Keys are raw YYYY-MM-DD strings (no Date parsing) to avoid UTC day shifts.
  const inspectionsByDate: Record<string, Inspection[]> = {};
  for (const i of allInspections) {
    const k = toDateKey(i.date);
    if (!k) continue;
    if (!inspectionsByDate[k]) inspectionsByDate[k] = [];
    inspectionsByDate[k].push(i);
  }
  for (const k of Object.keys(inspectionsByDate)) {
    inspectionsByDate[k].sort((a, b) => a.time.localeCompare(b.time));
  }

  const monthLabel = new Date(calYear, calMonth, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calCells: (string | null)[] = [
    ...Array<string | null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, d) => {
      const mm = String(calMonth + 1).padStart(2, "0");
      const dd = String(d + 1).padStart(2, "0");
      return `${calYear}-${mm}-${dd}`;
    }),
  ];

  function shiftMonth(dir: -1 | 1) {
    const d = new Date(calYear, calMonth + dir, 1);
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
  }

  const selectedInspections = selectedDate ? inspectionsByDate[selectedDate] ?? [] : [];

  function openCreate() {
    setEditing(null);
    setForm({ clientId: "", propertyId: "", date: "", time: "", assignedStaffId: "", status: "Scheduled", notes: "", outcome: null });
    setShowForm(true);
  }

  function openEdit(inspection: Inspection) {
    setEditing(inspection);
    setForm({
      clientId: inspection.clientId,
      propertyId: inspection.propertyId,
      date: inspection.date,
      time: inspection.time,
      assignedStaffId: inspection.assignedStaffId ?? "",
      status: inspection.status,
      notes: inspection.notes,
      outcome: inspection.outcome ?? null,
    });
    setShowForm(true);
  }

  function handleSave() {
    if (editing) {
      updateInspection(editing.id, {
        clientId: form.clientId,
        propertyId: form.propertyId,
        date: form.date,
        time: form.time,
        assignedStaffId: form.assignedStaffId || null,
        status: form.status,
        notes: form.notes,
        outcome: form.outcome || null,
      });
    } else {
      createInspection({
        clientId: form.clientId,
        propertyId: form.propertyId,
        date: form.date,
        time: form.time,
        assignedStaffId: form.assignedStaffId || null,
        status: form.status,
        notes: form.notes,
        outcome: form.outcome || null,
      });
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleStatusChange(id: string, status: Inspection["status"]) {
    updateInspection(id, { status });
  }

  function handleDelete(id: string) {
    deleteInspection(id);
    setDeleteConfirm(null);
  }

  const columns = [
    { key: "client", label: "Client" },
    { key: "property", label: "Property" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "status", label: "Status" },
    { key: "outcome", label: "Outcome" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#09123c]">Inspections</h2>
          <p className="mt-1 text-[14px] text-[#6b8aa0]">{allInspections.length} total inspections</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-full bg-[#cc091b] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
        >
          Schedule Inspection
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search inspections…"
            className="w-full rounded-full border border-[#e3e9f0] bg-white py-2.5 pl-9 pr-4 text-[13px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-full border border-[#e3e9f0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6]"
        >
          <option value="All">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex gap-1 rounded-full border border-[#e3e9f0] bg-white p-1">
          <button
            onClick={() => setView("list")}
            className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors ${view === "list" ? "bg-[#09123c] text-white" : "text-[#6b8aa0] hover:text-[#09123c]"}`}
          >
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors ${view === "calendar" ? "bg-[#09123c] text-white" : "text-[#6b8aa0] hover:text-[#09123c]"}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-[#e3e9f0] bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="rounded-full border border-[#e3e9f0] px-3 py-1.5 text-[13px] font-bold text-[#09123c] transition-colors hover:bg-[#f8fafc]"
                aria-label="Previous month"
              >
                ←
              </button>
              <h3 className="text-[16px] font-bold text-[#09123c]">{monthLabel}</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const t = new Date();
                    setCalYear(t.getFullYear());
                    setCalMonth(t.getMonth());
                    setSelectedDate(today);
                    setSelectedInspectionId(null);
                  }}
                  className="rounded-full border border-[#e3e9f0] px-3 py-1.5 text-[12px] font-bold text-[#09123c] transition-colors hover:bg-[#f8fafc]"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="rounded-full border border-[#e3e9f0] px-3 py-1.5 text-[13px] font-bold text-[#09123c] transition-colors hover:bg-[#f8fafc]"
                  aria-label="Next month"
                >
                  →
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wider text-[#6b8aa0]">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className="py-1">
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {calCells.map((key, idx) => {
                if (!key) return <div key={`empty-${idx}`} />;
                const dayNum = Number(key.split("-")[2]);
                const bookings = inspectionsByDate[key] ?? [];
                const isToday = key === today;
                const isSelected = key === selectedDate;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedDate(key);
                      setSelectedInspectionId(null);
                    }}
                    aria-label={`${formatLongDate(key)}${bookings.length > 0 ? `, ${bookings.length} inspection${bookings.length === 1 ? "" : "s"}` : ", no inspections"}`}
                    className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-[13px] transition-colors sm:min-h-[56px] ${
                      isSelected
                        ? "border-[#09123c] bg-[#09123c] font-bold text-white"
                        : isToday
                          ? "border-[#cc091b] bg-[#cc091b]/5 font-bold text-[#09123c]"
                          : "border-transparent text-[#33415c] hover:border-[#e3e9f0] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <span>{dayNum}</span>
                    {bookings.length > 0 && (
                      <span className="mt-0.5 flex items-center gap-1" aria-hidden="true">
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[#cc091b]"}`} />
                        {bookings.length > 1 && (
                          <span className={`text-[10px] font-bold ${isSelected ? "text-white" : "text-[#cc091b]"}`}>
                            {bookings.length}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-[#e3e9f0] bg-white p-4 sm:p-6">
            {!selectedDate ? (
              <p className="text-[14px] text-[#6b8aa0]">Select a date to see its inspections.</p>
            ) : selectedInspections.length === 0 ? (
              <div>
                <h3 className="text-[16px] font-bold text-[#09123c]">{formatLongDate(selectedDate)}</h3>
                <p className="mt-2 text-[14px] text-[#6b8aa0]">No inspections booked for this date.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-[16px] font-bold text-[#09123c]">{formatLongDate(selectedDate)}</h3>
                <p className="mt-1 text-[13px] text-[#6b8aa0]">
                  {selectedInspections.length} inspection{selectedInspections.length === 1 ? "" : "s"}
                </p>
                <div className="mt-4 space-y-3">
                  {selectedInspections.map((i) => {
                    const client = i.clientId ? getClient(i.clientId) : null;
                    const property = i.propertyId ? getProperty(i.propertyId) : null;
                    const staffMember = i.assignedStaffId
                      ? getStaff().find((s) => s.id === i.assignedStaffId)
                      : null;
                    const expanded = selectedInspectionId === i.id;
                    return (
                      <div key={i.id} className="rounded-lg border border-[#e3e9f0]">
                        <button
                          type="button"
                          onClick={() => setSelectedInspectionId(expanded ? null : i.id)}
                          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
                          aria-expanded={expanded}
                        >
                          <div className="min-w-0">
                            <div className="truncate text-[14px] font-bold text-[#09123c]">
                              {i.time} — {client?.name ?? "Unknown client"}
                            </div>
                            <div className="truncate text-[12px] text-[#6b8aa0]">{property?.name ?? "Unknown property"}</div>
                          </div>
                          <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusColor(i.status)}`}>
                            {i.status}
                          </span>
                        </button>
                        {expanded && (
                          <div className="space-y-2 border-t border-[#eef3f7] px-4 py-3 text-[13px]">
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold text-[#09123c]">Client</span>
                              <span className="text-right text-[#4a556a]">{client?.name ?? "—"}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold text-[#09123c]">Email</span>
                              <span className="truncate text-right text-[#4a556a]">{client?.email ?? "—"}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold text-[#09123c]">Phone</span>
                              <span className="text-right text-[#4a556a]">{client?.phone ?? "—"}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold text-[#09123c]">Property</span>
                              <span className="text-right text-[#4a556a]">{property?.name ?? "—"}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold text-[#09123c]">Date</span>
                              <span className="text-right text-[#4a556a]">{formatLongDate(toDateKey(i.date))}</span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold text-[#09123c]">Time</span>
                              <span className="text-right text-[#4a556a]">{i.time}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-[#09123c]">Message</span>
                              <p className="mt-1 rounded-lg bg-[#f8fafc] px-3 py-2 text-[#4a556a]">
                                {i.notes?.trim() ? i.notes : "No message provided."}
                              </p>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold text-[#09123c]">Assigned staff</span>
                              <span className="text-right text-[#4a556a]">
                                {staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : "Unassigned"}
                              </span>
                            </div>
                            <div className="flex justify-between gap-2">
                              <span className="font-semibold text-[#09123c]">Submitted</span>
                              <span className="text-right text-[#4a556a]">{formatDate(i.createdAt)}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <select
                                value={i.status}
                                onChange={(e) => handleStatusChange(i.id, e.target.value as Inspection["status"])}
                                aria-label="Change inspection status"
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-bold outline-none ${statusColor(i.status)}`}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => openEdit(i)}
                                className="rounded-full border border-[#c8dce8] px-3 py-1 text-[11px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
                              >
                                Edit / Reschedule
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <AdminTable columns={columns}>
          {paginated.length === 0 ? (
            <AdminTableEmpty message="No inspections scheduled." colSpan={7} />
          ) : (
            paginated.map((inspection) => {
              const client = inspection.clientId ? getClient(inspection.clientId) : null;
              const property = inspection.propertyId ? getProperty(inspection.propertyId) : null;
              return (
                <tr key={inspection.id} className="transition-colors hover:bg-[#f8fafc]">
                  <td className="px-5 py-4 text-[13px] font-semibold text-[#09123c]">{client?.name ?? "—"}</td>
                  <td className="px-5 py-4 text-[13px] text-[#4a556a]">{property?.name ?? "—"}</td>
                  <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(inspection.date)}</td>
                  <td className="px-5 py-4 text-[13px] text-[#4a556a]">{inspection.time}</td>
                  <td className="px-5 py-4">
                    <select
                      value={inspection.status}
                      onChange={(e) => handleStatusChange(inspection.id, e.target.value as Inspection["status"])}
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold outline-none ${statusColor(inspection.status)}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#4a556a]">{inspection.outcome ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(inspection)}
                        className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                        title="Edit"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(inspection.id)}
                        className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-red-50 hover:text-[#cc091b]"
                        title="Delete"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </AdminTable>
      )}

      {totalPages > 1 && view === "list" && (
        <div className="flex items-center justify-between">
          <div className="text-[13px] text-[#6b8aa0]">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-full border border-[#e3e9f0] px-4 py-2 text-[13px] font-semibold text-[#09123c] transition-colors hover:bg-[#f8fafc] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-full border border-[#e3e9f0] px-4 py-2 text-[13px] font-semibold text-[#09123c] transition-colors hover:bg-[#f8fafc] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-[18px] font-bold text-[#09123c]">{editing ? "Edit Inspection" : "Schedule Inspection"}</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Client</label>
                <select
                  value={form.clientId}
                  onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Property</label>
                <select
                  value={form.propertyId}
                  onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                >
                  <option value="">Select property</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Inspection["status"] })}
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Outcome</label>
                <select
                  value={form.outcome ?? ""}
                  onChange={(e) => setForm({ ...form, outcome: e.target.value as Inspection["outcome"] })}
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                >
                  <option value="">Not set</option>
                  {OUTCOMES.map((o) => (
                    <option key={o} value={o!}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-[#dce4ea] px-4 py-2.5 text-[14px] text-[#09123c] outline-none focus:border-[#8ab5d6]"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-full border border-[#c8dce8] py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 rounded-full bg-[#cc091b] py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
              >
                {editing ? "Update" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 ">
            <h3 className="text-[18px] font-bold text-[#09123c]">Delete Inspection</h3>
            <p className="mt-2 text-[14px] text-[#6b8aa0]">
              Are you sure you want to permanently delete this inspection? This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-full border border-[#c8dce8] py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 rounded-full bg-[#cc091b] py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
