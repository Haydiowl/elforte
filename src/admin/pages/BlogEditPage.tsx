import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Blog } from "../../lib/types";
import { getArticle, createArticle, updateArticle, getMedia } from "../../lib/db";
import { can } from "../../lib/permissions";
import { AdminField, inputCls } from "../components/AdminForm";
import RichTextEditor from "../components/RichTextEditor";

const STATUSES = ["Draft", "Published", "Scheduled", "Archived"] as const;

// Development-only guard: data URLs live in localStorage, so keep uploads small.
const MAX_UPLOAD_BYTES = 1024 * 1024;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BlogEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const existing = isNew ? null : getArticle(id);

  const [form, setForm] = useState<Blog>(
    existing ?? {
      id: "",
      title: "",
      slug: "",
      category: "",
      excerpt: "",
      featuredImage: "",
      content: "",
      author: "",
      status: "Draft",
      seoTitle: "",
      seoDescription: "",
      socialImage: "",
      views: 0,
      publishedAt: null,
      createdAt: "",
      updatedAt: "",
    }
  );

  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number; width: number | null; height: number | null } | null>(null);

  function update<K extends keyof Blog>(key: K, value: Blog[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setValidationError("");
    setFeedback("");
  }

  function setImage(url: string, meta?: { name: string; size: number; width: number | null; height: number | null } | null) {
    update("featuredImage", url);
    setImageMeta(meta ?? null);
    setImageError("");
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    setImageError("");
    if (!file.type.startsWith("image/")) {
      setImageError(`Unsupported file type: ${file.type}. Use JPG, PNG, WEBP, or SVG.`);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setImageError(
        `"${file.name}" is too large for local draft storage (max 1MB per image in this dev build). Pick an image from the media library instead.`
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImage(url, { name: file.name, size: file.size, width: img.width, height: img.height });
      };
      img.onerror = () => {
        setImage(url, { name: file.name, size: file.size, width: null, height: null });
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function persist(status: Blog["status"]): string {
    const slug = form.slug.trim() || generateSlug(form.title);
    const payload = { ...form, slug, status };
    const { id: _id, createdAt: _created, updatedAt: _updated, ...rest } = payload;
    if (isNew && !form.id) {
      const created = createArticle({ ...rest, slug });
      setForm({ ...created });
      return created.id;
    }
    const targetId = form.id || id!;
    updateArticle(targetId, { ...rest, slug });
    return targetId;
  }

  function handleSaveDraft() {
    if (isNew ? !can("blog", "create") : !can("blog", "edit")) {
      setValidationError("Your role does not allow saving posts.");
      return;
    }
    setSaving(true);
    setValidationError("");
    setFeedback("");
    setTimeout(() => {
      const savedId = persist("Draft");
      setSaving(false);
      setFeedback("Draft saved. You can leave and resume editing anytime.");
      if (isNew) navigate(`/admin/blog/${savedId}`);
    }, 300);
  }

  function handlePublish() {
    if (!can("blog", "publish")) {
      setValidationError("Your role does not allow publishing posts.");
      return;
    }
    const missing: string[] = [];
    if (!form.title.trim()) missing.push("title");
    if (!(form.slug.trim() || form.title.trim())) missing.push("slug");
    if (!form.content.trim()) missing.push("content");
    if (missing.length > 0) {
      setValidationError(`Cannot publish yet — missing: ${missing.join(", ")}. Fill these in, then try again.`);
      return;
    }
    setSaving(true);
    setValidationError("");
    setFeedback("");
    setTimeout(() => {
      const savedId = persist("Published");
      const saved = getArticle(savedId);
      setSaving(false);
      if (!saved) {
        setValidationError("Post was saved but could not be loaded for preview. Please open it from the blog list.");
        return;
      }
      setFeedback("Post published.");
      navigate(`/blog/${saved.slug}`);
    }, 300);
  }

  function handlePreview() {
    const missing: string[] = [];
    if (!form.title.trim()) missing.push("title");
    if (!form.content.trim()) missing.push("content");
    if (missing.length > 0) {
      setValidationError(`Add ${missing.join(" and ")} before previewing. Your work is kept — nothing was discarded.`);
      return;
    }
    const savedId = persist(form.status === "Published" ? "Published" : "Draft");
    const slug = form.slug.trim() || generateSlug(form.title);
    void savedId;
    window.open(`/blog/${slug}`, "_blank", "noopener");
  }

  const mediaLibrary = getMedia();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#09123c]">
            {isNew ? "New Post" : existing?.title || "Edit Post"}
          </h2>
          <p className="mt-1 text-[14px] text-[#6b8aa0]">
            {isNew ? "Write a new blog article. Unpublished work is kept as a draft." : `Last updated ${formatDate(existing?.updatedAt)}`}
          </p>
        </div>
      </div>

      {validationError && (
        <div role="alert" className="rounded-lg border border-[#cc091b]/30 bg-[#cc091b]/5 px-4 py-3 text-[13px] font-medium text-[#cc091b]">
          {validationError}
        </div>
      )}
      {feedback && (
        <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-medium text-emerald-700">
          {feedback}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Writing interface — primary focus */}
          <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 sm:p-8">
            <div className="space-y-5">
              <AdminField label="Title">
                <input
                  value={form.title}
                  onChange={(e) => {
                    update("title", e.target.value);
                    if (isNew) update("slug", generateSlug(e.target.value));
                  }}
                  placeholder="Post title"
                  className={inputCls}
                />
              </AdminField>
              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField label="Slug">
                  <input
                    value={form.slug}
                    onChange={(e) => update("slug", e.target.value)}
                    placeholder="post-slug"
                    className={inputCls}
                  />
                </AdminField>
                <AdminField label="Category">
                  <input
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    placeholder="e.g. Property Guide"
                    className={inputCls}
                  />
                </AdminField>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <AdminField label="Author">
                  <input
                    value={form.author}
                    onChange={(e) => update("author", e.target.value)}
                    placeholder="Author name"
                    className={inputCls}
                  />
                </AdminField>
                <AdminField label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value as Blog["status"])}
                    className={inputCls}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </AdminField>
              </div>
              <AdminField label="Excerpt">
                <textarea
                  value={form.excerpt}
                  onChange={(e) => update("excerpt", e.target.value)}
                  rows={3}
                  placeholder="Brief summary shown on cards and in search results"
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Content">
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => update("content", html)}
                  placeholder="Write your article…"
                />
              </AdminField>
            </div>
          </div>

          {/* Image section — under the editor */}
          <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#09123c]">Featured Image</h3>
              {form.featuredImage && (
                <button
                  type="button"
                  onClick={() => {
                    setImage("", null);
                  }}
                  className="text-[12px] font-bold text-[#cc091b] hover:underline"
                >
                  Remove image
                </button>
              )}
            </div>
            <p className="mt-1 text-[13px] text-[#6b8aa0]">
              Uploads are stored locally in this development build (max 1MB per file). For larger files, pick an
              image from the media library.
            </p>
            {imageError && (
              <div role="alert" className="mt-3 rounded-lg border border-[#cc091b]/30 bg-[#cc091b]/5 px-4 py-3 text-[13px] font-medium text-[#cc091b]">
                {imageError}
              </div>
            )}
            {form.featuredImage ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-[#e3e9f0]">
                <img src={form.featuredImage} alt="Featured" className="max-h-64 w-full object-cover" />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef3f7] bg-[#f8fafc] px-4 py-3">
                  <div className="text-[12px] text-[#6b8aa0]">
                    {imageMeta
                      ? `${imageMeta.name} · ${formatBytes(imageMeta.size)}${imageMeta.width && imageMeta.height ? ` · ${imageMeta.width}×${imageMeta.height}` : ""}`
                      : "Existing image reference preserved from this post."}
                  </div>
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-[#c8dce8] px-4 py-2 text-[12px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]">
                    Replace image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        handleFile(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c8dce8] bg-[#f8fafc] px-6 py-8 text-center transition-colors hover:border-[#8ab5d6]">
                  <span className="text-[14px] font-bold text-[#09123c]">Upload image</span>
                  <span className="mt-1 text-[12px] text-[#6b8aa0]">JPG, PNG, WEBP, or SVG · max 1MB in dev build</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={(e) => {
                      handleFile(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}
            {mediaLibrary.length > 0 && (
              <div className="mt-4">
                <h4 className="text-[13px] font-bold text-[#09123c]">Or pick from media library</h4>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {mediaLibrary.slice(0, 12).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setImage(m.url, null)}
                      className={`overflow-hidden rounded-lg border transition-colors hover:border-[#8ab5d6] ${
                        form.featuredImage === m.url ? "border-[#cc091b] ring-2 ring-[#cc091b]/30" : "border-[#e3e9f0]"
                      }`}
                      title={m.name}
                    >
                      <img src={m.url} alt={m.alt || m.name} className="h-14 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 sm:p-8">
            <h3 className="text-[16px] font-bold text-[#09123c]">SEO</h3>
            <div className="mt-5 space-y-5">
              <AdminField label="SEO Title">
                <input
                  value={form.seoTitle}
                  onChange={(e) => update("seoTitle", e.target.value)}
                  placeholder="e.g. Your Post Title — Elforte"
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="SEO Description">
                <textarea
                  value={form.seoDescription}
                  onChange={(e) => update("seoDescription", e.target.value)}
                  rows={3}
                  placeholder="Brief description for search engines"
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Social Sharing Image URL">
                <input
                  value={form.socialImage}
                  onChange={(e) => update("socialImage", e.target.value)}
                  placeholder="/images/social.jpg"
                  className={inputCls}
                />
              </AdminField>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#e3e9f0] bg-white p-6">
            <h3 className="text-[16px] font-bold text-[#09123c]">Publishing</h3>
            <div className="mt-2 text-[13px] text-[#6b8aa0]">
              Current status: <span className="font-bold text-[#09123c]">{form.status}</span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="w-full rounded-full border border-[#c8dce8] py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Draft"}
              </button>
              <button
                onClick={handlePreview}
                disabled={saving}
                className="w-full rounded-full border border-[#c8dce8] py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6] disabled:opacity-60"
              >
                Preview
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="w-full rounded-full bg-[#cc091b] py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Publish"}
              </button>
              {form.status === "Published" && (
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="w-full rounded-full border border-[#c8dce8] py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6] disabled:opacity-60"
                >
                  Unpublish
                </button>
              )}
              {form.status !== "Archived" && !isNew && (
                <button
                  onClick={() => {
                    update("status", "Archived");
                    setTimeout(() => handleSaveDraft(), 0);
                  }}
                  disabled={saving}
                  className="w-full rounded-full border border-[#c8dce8] py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6] disabled:opacity-60"
                >
                  Archive
                </button>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => navigate("/admin/blog")}
                className="w-full rounded-full border border-[#c8dce8] px-4 py-2 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
