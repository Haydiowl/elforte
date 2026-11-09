import { useState } from "react";
import AdminTable, { AdminTableEmpty } from "../components/AdminTable";
import { getInquiries, updateInquiry, deleteInquiry, getClient, getProperty } from "../../lib/db";
import type { Inquiry } from "../../lib/types";

const STATUSES: Inquiry["status"][] = ["New", "Contacted", "Qualified", "Inspection Scheduled", "Converted", "Closed", "Lost"];
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
    case "Qualified":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Inspection Scheduled":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Converted":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Closed":
    case "Lost":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export default function InquiriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField] = useState<"createdAt" | "status">("createdAt");
  const [sortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allInquiries = getInquiries();

  const filtered = allInquiries
    .filter((i) => {
      const q = search.trim().toLowerCase();
      const client = i.clientId ? getClient(i.clientId) : null;
      const property = i.propertyId ? getProperty(i.propertyId) : null;
      const matchesSearch = !q || `${client?.name ?? ""} ${property?.name ?? ""} ${i.message}`.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || i.status === statusFilter;
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

  function handleStatusChange(id: string, status: Inquiry["status"]) {
    updateInquiry(id, { status });
  }

  function handleDelete(id: string) {
    deleteInquiry(id);
    setDeleteConfirm(null);
  }

  const columns = [
    { key: "client", label: "Client" },
    { key: "property", label: "Property" },
    { key: "message", label: "Message" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-bold text-[#09123c]">Inquiries</h2>
        <p className="mt-1 text-[14px] text-[#6b8aa0]">{allInquiries.length} total inquiries</p>
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
            placeholder="Search inquiries…"
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
      </div>

      <AdminTable columns={columns}>
        {paginated.length === 0 ? (
          <AdminTableEmpty message="No inquiries found." colSpan={7} />
        ) : (
          paginated.map((inquiry) => {
            const client = inquiry.clientId ? getClient(inquiry.clientId) : null;
            const property = inquiry.propertyId ? getProperty(inquiry.propertyId) : null;
            return (
              <tr key={inquiry.id} className="transition-colors hover:bg-[#f8fafc]">
                <td className="px-5 py-4 text-[13px] font-semibold text-[#09123c]">{client?.name ?? "—"}</td>
                <td className="px-5 py-4 text-[13px] text-[#4a556a]">{property?.name ?? "—"}</td>
                <td className="px-5 py-4 text-[13px] text-[#4a556a] max-w-[200px] truncate">{inquiry.message}</td>
                <td className="px-5 py-4 text-[13px] text-[#4a556a]">{inquiry.source}</td>
                <td className="px-5 py-4">
                  <select
                    value={inquiry.status}
                    onChange={(e) => handleStatusChange(inquiry.id, e.target.value as Inquiry["status"])}
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold outline-none ${statusColor(inquiry.status)}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(inquiry.createdAt)}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => setDeleteConfirm(inquiry.id)}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-red-50 hover:text-[#cc091b]"
                    title="Delete"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </AdminTable>

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
            <h3 className="text-[18px] font-bold text-[#09123c]">Delete Inquiry</h3>
            <p className="mt-2 text-[14px] text-[#6b8aa0]">
              Are you sure you want to permanently delete this inquiry? This action cannot be undone.
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
