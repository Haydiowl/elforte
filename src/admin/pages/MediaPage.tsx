import { useState, useRef } from "react";
import { getMedia, saveMedia, deleteMedia } from "../../lib/db";
import type { Media } from "../../lib/types";
import AdminTable, { AdminTableEmpty } from "../components/AdminTable";
import ViewSwitcher, { useViewMode } from "../components/ViewSwitcher";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function MediaPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selected, setSelected] = useState<Media | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [view, setView] = useViewMode("media", "grid");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const allMedia = getMedia();
  const types = Array.from(new Set(allMedia.map((m) => m.type))).sort();

  const filtered = allMedia.filter((m) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || m.name.toLowerCase().includes(q);
    const matchesType = typeFilter === "All" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  function handleFiles(files: FileList | null) {
    if (!files) return;
    setError("");
    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`Unsupported file type: ${file.type}. Use JPG, PNG, WEBP, or SVG.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`File too large: ${file.name}. Maximum size is 5MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const img = new Image();
        img.onload = () => {
          saveMedia({
            name: file.name,
            url,
            type: file.type,
            size: file.size,
            width: img.width,
            height: img.height,
            alt: file.name,
          });
        };
        img.onerror = () => {
          saveMedia({
            name: file.name,
            url,
            type: file.type,
            size: file.size,
            width: null,
            height: null,
            alt: file.name,
          });
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
    if (dropRef.current) dropRef.current.classList.remove("border-[#cc091b]");
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (dropRef.current) dropRef.current.classList.add("border-[#cc091b]");
  }

  function handleDragLeave() {
    if (dropRef.current) dropRef.current.classList.remove("border-[#cc091b]");
  }

  function handleRename() {
    if (!selected) return;
    const newName = renameValue.trim();
    if (newName) {
      saveMedia({ ...selected, name: newName });
    }
    setRenaming(false);
    setRenameValue("");
  }

  function handleDelete(id: string) {
    deleteMedia(id);
    setDeleteConfirm(null);
    if (selected?.id === id) setSelected(null);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#09123c]">Media Library</h2>
          <p className="mt-1 text-[14px] text-[#6b8aa0]">{allMedia.length} files</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center justify-center rounded-full bg-[#cc091b] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
        >
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.svg"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="rounded-xl border-2 border-dashed border-[#c8dce8] bg-white p-8 text-center transition-colors"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf4fc]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#09123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="mt-3 text-[14px] font-semibold text-[#09123c]">Drag & drop images here</p>
        <p className="mt-1 text-[13px] text-[#6b8aa0]">JPG, PNG, WEBP, SVG up to 5MB</p>
      </div>

      {error && (
        <div className="rounded-lg border border-[#cc091b]/30 bg-[#cc091b]/5 px-4 py-2.5 text-[13px] font-medium text-[#cc091b]">
          {error}
        </div>
      )}

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media…"
            className="w-full rounded-full border border-[#e3e9f0] bg-white py-2.5 pl-9 pr-4 text-[13px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-full border border-[#e3e9f0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#09123c] outline-none transition-colors focus:border-[#8ab5d6]"
        >
          <option value="All">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t.split("/")[1]?.toUpperCase() ?? t}
            </option>
          ))}
        </select>

        <ViewSwitcher mode={view} onChange={setView} />
      </div>

      {view === "grid" ? (
      <>
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[#e3e9f0] bg-white p-12 text-center">
          <p className="text-[14px] text-[#6b8aa0]">No media found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="group relative overflow-hidden rounded-xl border border-[#e3e9f0] bg-white text-left transition-shadow"
            >
              <div className="aspect-square w-full overflow-hidden bg-[#f8fafc]">
                <img src={item.url} alt={item.alt} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="p-3">
                <div className="truncate text-[13px] font-semibold text-[#09123c]">{item.name}</div>
                <div className="mt-0.5 text-[11px] text-[#6b8aa0]">{formatSize(item.size)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      </>
      ) : (
        <AdminTable
          columns={[
            { key: "file", label: "File" },
            { key: "type", label: "Type" },
            { key: "size", label: "Size" },
            { key: "dimensions", label: "Dimensions" },
            { key: "uploaded", label: "Uploaded" },
            { key: "actions", label: "Actions" },
          ]}
        >
          {filtered.length === 0 ? (
            <AdminTableEmpty message="No media found." colSpan={6} />
          ) : (
            filtered.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-[#f8fafc]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img src={item.url} alt={item.alt} className="h-10 w-14 rounded-lg object-cover" loading="lazy" />
                    <div className="text-[14px] font-bold text-[#09123c]">{item.name}</div>
                  </div>
                </td>
                <td className="px-5 py-4 text-[13px] text-[#4a556a]">{item.type.split("/")[1]?.toUpperCase() ?? item.type}</td>
                <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatSize(item.size)}</td>
                <td className="px-5 py-4 text-[13px] text-[#4a556a]">
                  {item.width && item.height ? `${item.width} × ${item.height}` : "—"}
                </td>
                <td className="px-5 py-4 text-[13px] text-[#4a556a]">{formatDate(item.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelected(item)}
                      className="rounded-lg p-1.5 text-[12px] font-bold text-[#09123c] transition-colors hover:bg-[#eaf4fc]"
                      title="View details"
                    >
                      View
                    </button>
                    <button
                      onClick={() => copyUrl(item.url)}
                      className="rounded-lg p-1.5 text-[12px] font-bold text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c]"
                      title="Copy URL"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="rounded-lg p-1.5 text-[12px] font-bold text-[#6b8aa0] transition-colors hover:bg-red-50 hover:text-[#cc091b]"
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </AdminTable>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="text-[18px] font-bold text-[#09123c]">Image Details</h3>
              <button onClick={() => setSelected(null)} className="text-[#6b8aa0] hover:text-[#09123c]" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg border border-[#e3e9f0]">
              <img src={selected.url} alt={selected.alt} className="max-h-[300px] w-full object-contain bg-[#f8fafc]" />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Name</div>
                {renaming ? (
                  <div className="mt-1 flex gap-2">
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="flex-1 rounded-lg border border-[#dce4ea] px-3 py-1.5 text-[13px] outline-none focus:border-[#8ab5d6]"
                    />
                    <button onClick={handleRename} className="rounded-full bg-[#cc091b] px-3 py-1.5 text-[12px] font-bold text-white">
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[14px] text-[#09123c]">{selected.name}</span>
                    <button
                      onClick={() => {
                        setRenaming(true);
                        setRenameValue(selected.name);
                      }}
                      className="text-[12px] text-[#cc091b] hover:underline"
                    >
                      Rename
                    </button>
                  </div>
                )}
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Type</div>
                <div className="mt-1 text-[14px] text-[#09123c]">{selected.type}</div>
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Size</div>
                <div className="mt-1 text-[14px] text-[#09123c]">{formatSize(selected.size)}</div>
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Dimensions</div>
                <div className="mt-1 text-[14px] text-[#09123c]">
                  {selected.width && selected.height ? `${selected.width} × ${selected.height}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Uploaded</div>
                <div className="mt-1 text-[14px] text-[#09123c]">{formatDate(selected.createdAt)}</div>
              </div>
              <div>
                <div className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Alt Text</div>
                <div className="mt-1 text-[14px] text-[#09123c]">{selected.alt || "—"}</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => copyUrl(selected.url)}
                className="rounded-full border border-[#c8dce8] px-5 py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
              >
                Copy URL
              </button>
              <button
                onClick={() => setDeleteConfirm(selected.id)}
                className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-[13px] font-bold text-red-700 transition-colors hover:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 ">
            <h3 className="text-[18px] font-bold text-[#09123c]">Delete Media</h3>
            <p className="mt-2 text-[14px] text-[#6b8aa0]">
              Are you sure you want to permanently delete this file? This action cannot be undone.
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
