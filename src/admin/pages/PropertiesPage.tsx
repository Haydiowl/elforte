import { useState } from "react";
import type { Property } from "../../lib/types";
import { getProperties, createProperty, updateProperty, deleteProperty, archiveProperty } from "../../lib/db";
import { can, canAccessProperty } from "../../lib/permissions";
import AdminTable, { AdminTableEmpty } from "../components/AdminTable";
import ViewSwitcher, { useViewMode } from "../components/ViewSwitcher";

const STATUSES = ["Draft", "Available", "Under Offer", "Sold", "Closed", "Archived"] as const;

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
    case "Available":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Under Offer":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Sold":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Closed":
      return "bg-slate-100 text-slate-600 border-slate-200";
    case "Draft":
      return "bg-slate-50 text-slate-500 border-slate-200";
    case "Archived":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortField] = useState<"name" | "updatedAt" | "views" | "inquiryCount">("updatedAt");
  const [sortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode("properties", "grid");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allProperties = getProperties().filter((p) => canAccessProperty(p.id));

  const filtered = allProperties
    .filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || `${p.name} ${p.location} ${p.shortDescription}`.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleDuplicate(property: Property) {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = property;
    createProperty({ ...rest, name: `${property.name} (Copy)`, slug: `${property.slug}-copy-${Date.now().toString(36)}`, status: "Draft", views: 0, inquiryCount: 0 });
  }

  function handleDelete(id: string) {
    deleteProperty(id);
    setDeleteConfirm(null);
  }

  function handleArchive(id: string) {
    archiveProperty(id);
  }

  function handlePublish(id: string) {
    updateProperty(id, { status: "Available" });
  }

  function handleUnpublish(id: string) {
    updateProperty(id, { status: "Draft" });
  }

  const columns = [
    { key: "name", label: "Property" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
    { key: "views", label: "Views" },
    { key: "inquiries", label: "Inquiries" },
    { key: "updated", label: "Updated" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#09123c]">Properties</h2>
          <p className="mt-1 text-[14px] text-[#6b8aa0]">{allProperties.length} total properties</p>
        </div>
        {can("properties", "create") && (
        <a
          href="/admin/properties/new"
          className="inline-flex items-center justify-center rounded-full bg-[#cc091b] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
        >
          Add Property
        </a>
        )}
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
            placeholder="Search properties…"
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
          <AdminTableEmpty message="No properties found. Adjust your search or add a new property." colSpan={7} />
        ) : (
          paginated.map((property) => (
            <tr key={property.id} className="transition-colors hover:bg-[#f8fafc]">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={property.featuredImage || "/images/property-lot.jpg"}
                    alt={property.name}
                    className="h-10 w-14 rounded-lg object-cover"
                  />
                  <div>
                    <div className="text-[14px] font-bold text-[#09123c]">{property.name}</div>
                    <div className="text-[12px] text-[#6b8aa0]">{property.propertyType}</div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{property.location}</td>
              <td className="px-5 py-4">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusColor(property.status)}`}>
                  {property.status}
                </span>
              </td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{property.views}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{property.inquiryCount}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(property.updatedAt)}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  {can("properties", "edit") && (
                  <a
                    href={`/admin/properties/${property.id}`}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                    title={property.status === "Draft" ? "Resume Editing" : "Edit"}
                    aria-label={property.status === "Draft" ? `Resume editing ${property.name}` : `Edit ${property.name}`}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </a>
                  )}
                  {can("properties", "create") && (
                  <button
                    onClick={() => handleDuplicate(property)}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                    title="Duplicate"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                  )}
                  {can("properties", "archive") && property.status !== "Archived" ? (
                    <button
                      onClick={() => handleArchive(property.id)}
                      className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-amber-50 hover:text-amber-600"
                      title="Archive"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="5" rx="1" />
                        <path d="M4 8v11a2 2 0 002 2h12a2 2 0 002-2V8" />
                        <path d="M10 12h4" />
                      </svg>
                    </button>
                  ) : null}
                  {can("properties", "publish") && property.status === "Draft" ? (
                    <button
                      onClick={() => handlePublish(property.id)}
                      className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                      title="Publish"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" />
                        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  ) : can("properties", "publish") && property.status === "Available" ? (
                    <button
                      onClick={() => handleUnpublish(property.id)}
                      className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-slate-100 hover:text-slate-600"
                      title="Unpublish"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  ) : null}
                  {can("properties", "delete") && (
                  <button
                    onClick={() => setDeleteConfirm(property.id)}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-red-50 hover:text-[#cc091b]"
                    title="Delete"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        )}
      </AdminTable>
      ) : paginated.length === 0 ? (
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-12 text-center">
          <p className="text-[14px] text-[#6b8aa0]">No properties found. Adjust your search or add a new property.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((property) => (
            <article key={property.id} className="flex flex-col overflow-hidden rounded-xl border border-[#e3e9f0] bg-white">
              <div className="relative">
                <img
                  src={property.featuredImage || "/images/property-lot.jpg"}
                  alt={property.name}
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
                <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusColor(property.status)}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  {property.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="text-[15px] font-bold text-[#09123c]">{property.name}</div>
                <div className="mt-1 text-[13px] text-[#6b8aa0]">{property.location}</div>
                <div className="mt-1 text-[13px] font-semibold text-[#09123c]">{property.price ? property.price : property.propertyType}</div>
                <div className="mt-3 flex items-center gap-1 border-t border-[#eef3f7] pt-3">
                  {can("properties", "edit") && (
                    <a
                      href={`/admin/properties/${property.id}`}
                      className="rounded-lg p-1.5 text-[12px] font-bold text-[#09123c] transition-colors hover:bg-[#eaf4fc]"
                      title={property.status === "Draft" ? "Resume Editing" : "Edit"}
                    >
                      {property.status === "Draft" ? "Resume" : "Edit"}
                    </a>
                  )}
                  {can("properties", "create") && (
                    <button
                      onClick={() => handleDuplicate(property)}
                      className="rounded-lg p-1.5 text-[12px] font-bold text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                      title="Duplicate"
                    >
                      Duplicate
                    </button>
                  )}
                  <span className="flex-1" />
                  {can("properties", "publish") && property.status === "Draft" && (
                    <button
                      onClick={() => handlePublish(property.id)}
                      className="rounded-full bg-[#cc091b] px-3 py-1.5 text-[12px] font-bold text-white transition-all hover:bg-[#b50818]"
                      title="Publish"
                    >
                      Publish
                    </button>
                  )}
                  {can("properties", "delete") && (
                    <button
                      onClick={() => setDeleteConfirm(property.id)}
                      className="rounded-lg p-1.5 text-[12px] font-bold text-[#6b8aa0] transition-colors hover:bg-red-50 hover:text-[#cc091b]"
                      title="Delete"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
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
            <h3 className="text-[18px] font-bold text-[#09123c]">Delete Property</h3>
            <p className="mt-2 text-[14px] text-[#6b8aa0]">
              Are you sure you want to permanently delete this property? This action cannot be undone.
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
