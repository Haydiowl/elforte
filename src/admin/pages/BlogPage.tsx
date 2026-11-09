import { useState } from "react";
import { Link } from "react-router-dom";
import AdminTable, { AdminTableEmpty } from "../components/AdminTable";
import ViewSwitcher, { useViewMode } from "../components/ViewSwitcher";
import { getArticles, deleteArticle, updateArticle, archiveArticle, createArticle } from "../../lib/db";
import { can } from "../../lib/permissions";
import type { Blog } from "../../lib/types";

const STATUSES = ["Draft", "Published", "Scheduled", "Archived"] as const;
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
    case "Published":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Scheduled":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Draft":
      return "bg-slate-50 text-slate-500 border-slate-200";
    case "Archived":
      return "bg-red-50 text-red-600 border-red-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export default function BlogPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField] = useState<"title" | "updatedAt" | "views" | "publishedAt">("updatedAt");
  const [sortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [view, setView] = useViewMode("blog", "list");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const allArticles = getArticles();
  const categories = Array.from(new Set(allArticles.map((a) => a.category).filter(Boolean))).sort();

  const filtered = allArticles
    .filter((a) => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "All" || a.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
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

  function handleDuplicate(article: Blog) {
    const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = article;
    createArticle({
      ...rest,
      title: `${article.title} (Copy)`,
      slug: `${article.slug}-copy-${Date.now().toString(36)}`,
      status: "Draft",
      views: 0,
      publishedAt: null,
    });
  }

  function handleDelete(id: string) {
    deleteArticle(id);
    setDeleteConfirm(null);
  }

  function handleArchive(id: string) {
    archiveArticle(id);
  }

  function handlePublish(id: string) {
    updateArticle(id, { status: "Published", publishedAt: new Date().toISOString() });
  }

  function handleUnpublish(id: string) {
    updateArticle(id, { status: "Draft" });
  }

  const columns = [
    { key: "image", label: "Image" },
    { key: "title", label: "Title" },
    { key: "category", label: "Category" },
    { key: "author", label: "Author" },
    { key: "status", label: "Status" },
    { key: "views", label: "Views" },
    { key: "publishedAt", label: "Published" },
    { key: "updatedAt", label: "Updated" },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#09123c]">Blog</h2>
          <p className="mt-1 text-[14px] text-[#6b8aa0]">{allArticles.length} total articles</p>
        </div>
        {can("blog", "create") && (
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center justify-center rounded-full bg-[#cc091b] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
        >
          New Post
        </Link>
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
            placeholder="Search articles…"
            className="w-full rounded-full border border-[#e3e9f0] bg-white py-2.5 pl-9 pr-4 text-[13px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-full border border-[#e3e9f0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6]"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

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
          <AdminTableEmpty message="No articles found. Create your first post." colSpan={9} />
        ) : (
          paginated.map((article) => (
            <tr key={article.id} className="transition-colors hover:bg-[#f8fafc]">
              <td className="px-5 py-4">
                <img
                  src={article.featuredImage || "/images/blog-1.jpg"}
                  alt={article.title}
                  className="h-10 w-14 rounded-lg object-cover"
                />
              </td>
              <td className="px-5 py-4">
                <div className="text-[14px] font-bold text-[#09123c]">{article.title}</div>
              </td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{article.category}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{article.author || "—"}</td>
              <td className="px-5 py-4">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusColor(article.status)}`}>
                  {article.status}
                </span>
              </td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{article.views}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(article.publishedAt)}</td>
              <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(article.updatedAt)}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1">
                  {can("blog", "edit") && (
                  <Link
                    to={`/admin/blog/${article.id}`}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                    title="Edit"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </Link>
                  )}
                  {can("blog", "create") && (
                  <button
                    onClick={() => handleDuplicate(article)}
                    className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                    title="Duplicate"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                  )}
                  {can("blog", "archive") && article.status !== "Archived" ? (
                    <button
                      onClick={() => handleArchive(article.id)}
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
                  {can("blog", "publish") && article.status === "Draft" ? (
                    <button
                      onClick={() => handlePublish(article.id)}
                      className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                      title="Publish"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" />
                        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                      </svg>
                    </button>
                  ) : can("blog", "publish") && article.status === "Published" ? (
                    <button
                      onClick={() => handleUnpublish(article.id)}
                      className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-slate-100 hover:text-slate-600"
                      title="Unpublish"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                      </svg>
                    </button>
                  ) : null}
                  {can("blog", "delete") && (
                  <button
                    onClick={() => setDeleteConfirm(article.id)}
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
          <p className="text-[14px] text-[#6b8aa0]">No articles found. Create your first post.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map((article) => (
            <article key={article.id} className="flex flex-col overflow-hidden rounded-xl border border-[#e3e9f0] bg-white">
              <div className="relative">
                <img
                  src={article.featuredImage || "/images/blog-1.jpg"}
                  alt={article.title}
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                />
                <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusColor(article.status)}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  {article.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="inline-block self-start rounded-full bg-[#eaf4fc] px-3 py-0.5 text-[11px] font-semibold text-[#355672]">
                  {article.category || "Uncategorized"}
                </span>
                <div className="mt-2 text-[15px] font-bold leading-snug text-[#09123c]">{article.title}</div>
                <div className="mt-1 text-[12px] text-[#6b8aa0]">
                  {article.author || "—"} · {formatDate(article.publishedAt ?? article.updatedAt)}
                </div>
                <div className="mt-3 flex items-center gap-1 border-t border-[#eef3f7] pt-3">
                  {can("blog", "edit") && (
                    <Link
                      to={`/admin/blog/${article.id}`}
                      className="rounded-lg p-1.5 text-[12px] font-bold text-[#09123c] transition-colors hover:bg-[#eaf4fc]"
                      title="Edit"
                    >
                      Edit
                    </Link>
                  )}
                  {can("blog", "publish") && article.status === "Draft" && (
                    <button
                      onClick={() => handlePublish(article.id)}
                      className="rounded-full bg-[#cc091b] px-3 py-1.5 text-[12px] font-bold text-white transition-all hover:bg-[#b50818]"
                      title="Publish"
                    >
                      Publish
                    </button>
                  )}
                  <span className="flex-1" />
                  {can("blog", "delete") && (
                    <button
                      onClick={() => setDeleteConfirm(article.id)}
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
            <h3 className="text-[18px] font-bold text-[#09123c]">Delete Article</h3>
            <p className="mt-2 text-[14px] text-[#6b8aa0]">
              Are you sure you want to permanently delete this article? This action cannot be undone.
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
