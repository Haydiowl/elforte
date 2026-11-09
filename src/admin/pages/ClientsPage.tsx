import { useState } from "react";
import { Link } from "react-router-dom";
import AdminTable, { AdminTableEmpty } from "../components/AdminTable";
import ViewSwitcher, { useViewMode } from "../components/ViewSwitcher";
import { getClients, updateClient, deleteClient } from "../../lib/db";
import type { Client } from "../../lib/types";

const STATUSES: Client["status"][] = ["New", "Contacted", "Interested", "Inspection Scheduled", "Purchased", "Not Interested", "Lost"];
const PAGE_SIZE = 8;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "New":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Contacted":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Interested":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Inspection Scheduled":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Purchased":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Not Interested":
    case "Lost":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField] = useState<"name" | "createdAt" | "lastActivityAt">("lastActivityAt");
  const [sortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode("clients", "list");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allClients = getClients();

  const filtered = allClients
    .filter((c) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || `${c.name} ${c.email} ${c.phone} ${c.company}`.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleDelete(id: string) {
    deleteClient(id);
    setDeleteConfirm(null);
  }

  function handleStatusChange(id: string, status: Client["status"]) {
    updateClient(id, { status });
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created" },
    { key: "lastActivityAt", label: "Last Activity" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#09123c]">Clients</h2>
          <p className="mt-1 text-[14px] text-[#6b8aa0]">{allClients.length} total clients</p>
        </div>
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
            placeholder="Search clients…"
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

        <ViewSwitcher mode={view} onChange={setView} />
      </div>

      {view === "list" ? (
      <AdminTable columns={columns}>
        {paginated.length === 0 ? (
          <AdminTableEmpty message="No clients found." colSpan={8} />
        ) : (
          paginated.map((client) => (
            <tr key={client.id} className="transition-colors hover:bg-[#f8fafc]">
              <td className="px-5 py-4">
                <Link to={`/admin/clients/${client.id}`} className="text-[14px] font-bold text-[#09123c] hover:text-[#cc091b]">
                  {client.name}
                </Link>
              </td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{client.email}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{client.phone}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{client.source}</td>
              <td className="px-5 py-4">
                <select
                  value={client.status}
                  onChange={(e) => handleStatusChange(client.id, e.target.value as Client["status"])}
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold outline-none ${statusColor(client.status)}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(client.createdAt)}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(client.lastActivityAt)}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  <Link
                    to={`/admin/clients/${client.id}`}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                    title="View"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(client.id)}
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
          ))
        )}
      </AdminTable>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-12 text-center">
          <p className="text-[14px] text-[#6b8aa0]">No clients found.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((client) => {
            const initials = client.name
              .split(" ")
              .map((w) => w.charAt(0))
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <article key={client.id} className="flex flex-col rounded-xl border border-[#e3e9f0] bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf4fc] text-[14px] font-bold text-[#09123c]" aria-hidden="true">
                    {initials || "?"}
                  </span>
                  <div className="min-w-0">
                    <Link to={`/admin/clients/${client.id}`} className="block truncate text-[15px] font-bold text-[#09123c] hover:text-[#cc091b]">
                      {client.name}
                    </Link>
                    <div className="truncate text-[12px] text-[#6b8aa0]">{client.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-[13px] text-[#4a556a]">
                  <div className="truncate">{client.phone || "—"}</div>
                  <div className="truncate">{client.source || "—"}</div>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-[#eef3f7] pt-3">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusColor(client.status)}`}>
                    {client.status}
                  </span>
                  <span className="flex-1" />
                  <Link
                    to={`/admin/clients/${client.id}`}
                    className="rounded-lg p-1.5 text-[12px] font-bold text-[#09123c] transition-colors hover:bg-[#eaf4fc]"
                    title="View"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(client.id)}
                    className="rounded-lg p-1.5 text-[12px] font-bold text-[#6b8aa0] transition-colors hover:bg-red-50 hover:text-[#cc091b]"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
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

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 ">
            <h3 className="text-[18px] font-bold text-[#09123c]">Delete Client</h3>
            <p className="mt-2 text-[14px] text-[#6b8aa0]">
              Are you sure you want to permanently delete this client? This action cannot be undone.
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
