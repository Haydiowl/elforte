import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Property } from "../../lib/types";
import { getMedia } from "../../lib/db";
import { getProperty, createProperty, updateProperty } from "../../lib/db";
import { can, canAccessProperty } from "../../lib/permissions";
import { AdminField, inputCls } from "../components/AdminForm";

const STATUSES = ["Draft", "Available", "Under Offer", "Sold", "Closed", "Archived"] as const;

const STEPS = [
  "Basic Details",
  "Property Details",
  "Features",
  "SEO",
  "Review & Publish",
] as const;

const MAX_IMAGES = 5;
// Development-only guard: data URLs live in localStorage, so keep uploads small.
const MAX_UPLOAD_BYTES = 1024 * 1024;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
}

function basenameFromUrl(url: string): string {
  try {
    const clean = url.split("?")[0].split("#")[0];
    const parts = clean.split("/").filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || url);
  } catch {
    return url;
  }
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function emptyForm(): Property {
  return {
    id: "",
    name: "",
    slug: "",
    status: "Draft",
    propertyType: "Land",
    shortDescription: "",
    description: "",
    location: "",
    price: "",
    plotSize: "",
    titleDocumentation: "",
    availability: "",
    features: [],
    featuredImage: "",
    gallery: [],
    mapCoordinates: null,
    seoTitle: "",
    metaDescription: "",
    socialImage: "",
    views: 0,
    inquiryCount: 0,
    createdAt: "",
    updatedAt: "",
  };
}

export default function PropertyEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";
  const existing = isNew ? null : getProperty(id);

  if (!isNew && id && !canAccessProperty(id)) {
    return (
      <div className="rounded-xl border border-[#e3e9f0] bg-white p-12 text-center">
        <h2 className="text-[18px] font-bold text-[#09123c]">Access denied</h2>
        <p className="mx-auto mt-2 max-w-sm text-[14px] text-[#6b8aa0]">
          This property is outside your assigned property scope.
        </p>
      </div>
    );
  }

  const [form, setForm] = useState<Property>(existing ?? emptyForm());
  const [step, setStep] = useState(0);
  const [featureInput, setFeatureInput] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageMeta, setImageMeta] = useState<Record<string, { name: string; size: string }>>({});
  const [validationError, setValidationError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const lastStep = STEPS.length - 1;

  function update<K extends keyof Property>(key: K, value: Property[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setValidationError("");
    setFeedback("");
  }

  function addFeature() {
    const f = featureInput.trim();
    if (f && !form.features.includes(f)) {
      update("features", [...form.features, f]);
    }
    setFeatureInput("");
  }

  function removeFeature(index: number) {
    update(
      "features",
      form.features.filter((_, i) => i !== index)
    );
  }

  function galleryWithFeatured(gallery: string[]): { gallery: string[]; featuredImage: string } {
    const capped = gallery.slice(0, MAX_IMAGES);
    return { gallery: capped, featuredImage: capped[0] ?? "" };
  }

  function addImageUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (form.gallery.length >= MAX_IMAGES) {
      setImageError(`Maximum of ${MAX_IMAGES} images reached. Remove one to add another.`);
      return;
    }
    if (form.gallery.includes(url)) {
      setImageError("That image has already been added.");
      return;
    }
    setImageError("");
    setImageMeta((prev) => ({ ...prev, [url]: { name: basenameFromUrl(url), size: "Linked URL" } }));
    const next = galleryWithFeatured([...form.gallery, url]);
    setForm((prev) => ({ ...prev, ...next }));
    setImageUrlInput("");
    setValidationError("");
    setFeedback("");
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImageError("");
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setImageError(`Unsupported file type: ${file.type}. Use JPG, PNG, WEBP, or SVG.`);
        return;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setImageError(
          `"${file.name}" is too large for local draft storage (max 1MB per image in this dev build). Use an image URL or a smaller file.`
        );
        return;
      }
      if (form.gallery.length >= MAX_IMAGES) {
        setImageError(`Maximum of ${MAX_IMAGES} images reached. Remove one to add another.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setImageMeta((prev) => ({ ...prev, [url]: { name: file.name, size: formatBytes(file.size) } }));
        setForm((prev) => {
          if (prev.gallery.length >= MAX_IMAGES || prev.gallery.includes(url)) return prev;
          return { ...prev, ...galleryWithFeatured([...prev.gallery, url]) };
        });
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    const next = galleryWithFeatured(form.gallery.filter((_, i) => i !== index));
    setForm((prev) => ({ ...prev, ...next }));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= form.gallery.length) return;
    const next = [...form.gallery];
    [next[index], next[target]] = [next[target], next[index]];
    setForm((prev) => ({ ...prev, ...galleryWithFeatured(next) }));
  }

  function validateStep(s: number): string {
    if (s === 0 && !form.name.trim()) {
      return "Property name is required before continuing. Add a name in Basic Details.";
    }
    return "";
  }

  function validateForPublish(): string {
    const missing: string[] = [];
    if (!form.name.trim()) missing.push("property name");
    if (!(form.slug.trim() || form.name.trim())) missing.push("slug");
    if (!form.location.trim()) missing.push("location");
    if (missing.length > 0) {
      return `Cannot publish yet — missing: ${missing.join(", ")}. Fill these in, then try again.`;
    }
    return "";
  }

  function persist(status: Property["status"], done: (savedId: string) => void) {
    setSaving(true);
    setValidationError("");
    setFeedback("");
    const slug = form.slug.trim() || generateSlug(form.name);
    const featuredImage = form.gallery[0] ?? "";
    const payload = { ...form, slug, status, featuredImage };
    // Strip server-managed fields; the repository assigns them.
    const { id: _id, createdAt: _created, updatedAt: _updated, ...rest } = payload;
    setTimeout(() => {
      if (isNew && !form.id) {
        const created = createProperty({ ...rest, slug });
        setForm({ ...created });
        setSaving(false);
        setFeedback(status === "Draft" ? "Draft saved. You can leave and resume editing anytime." : "Property published.");
        done(created.id);
      } else {
        const targetId = form.id || id!;
        updateProperty(targetId, { ...rest, slug });
        setSaving(false);
        setFeedback(status === "Draft" ? "Draft saved. You can leave and resume editing anytime." : "Property published.");
        done(targetId);
      }
    }, 300);
  }

  function handleSaveDraft() {
    if (isNew ? !can("properties", "create") : !can("properties", "edit")) {
      setValidationError("Your role does not allow saving properties.");
      return;
    }
    persist("Draft", () => {});
  }

  function handlePublish() {
    if (!can("properties", "publish")) {
      setValidationError("Your role does not allow publishing properties.");
      return;
    }
    const err = validateForPublish();
    if (err) {
      setValidationError(err);
      return;
    }
    persist("Available", (savedId) => {
      const saved = getProperty(savedId);
      if (!saved) {
        setValidationError("Property was saved but could not be loaded for preview. Please open it from the property list.");
        return;
      }
      navigate(`/properties/${saved.slug}`);
    });
  }

  function goNext() {
    const err = validateStep(step);
    if (err) {
      setValidationError(err);
      return;
    }
    // Auto-generate slug from name when moving past Basic Details.
    if (step === 0 && !form.slug.trim() && form.name.trim()) {
      setForm((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
    }
    setValidationError("");
    setStep((s) => Math.min(s + 1, lastStep));
  }

  function goPrev() {
    setValidationError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  const mediaLibrary = getMedia();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[24px] font-bold text-[#09123c]">
          {isNew ? "New Property" : existing?.name || "Edit Property"}
        </h2>
        <p className="mt-1 text-[14px] text-[#6b8aa0]">
          {isNew
            ? "Create a new property listing. Unpublished work is kept as a draft."
            : `Last updated ${formatDate(existing?.updatedAt)}`}
        </p>
      </div>

      {/* Stepper */}
      <ol className="flex flex-wrap items-center gap-2" aria-label="Property creation steps">
        {STEPS.map((label, i) => {
          const done = i < step;
          const current = i === step;
          return (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (i <= step) {
                    setStep(i);
                    setValidationError("");
                  }
                }}
                disabled={i > step}
                className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors ${
                  current
                    ? "bg-[#09123c] text-white"
                    : done
                      ? "border border-[#8ab5d6] bg-[#eaf4fc] text-[#09123c]"
                      : "border border-[#e3e9f0] bg-white text-[#9db4c4]"
                } ${i > step ? "cursor-not-allowed opacity-60" : ""}`}
                aria-current={current ? "step" : undefined}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                    current ? "bg-white text-[#09123c]" : done ? "bg-[#09123c] text-white" : "bg-[#eef3f7] text-[#6b8aa0]"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 && <span className="hidden h-px w-4 bg-[#dce4ea] sm:block" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#eef3f7]">
        <div
          className="h-full rounded-full bg-[#cc091b] transition-all"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
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

      <div className="rounded-xl border border-[#e3e9f0] bg-white p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="text-[16px] font-bold text-[#09123c]">Basic Details</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label="Property Name *">
                <input
                  value={form.name}
                  onChange={(e) => {
                    update("name", e.target.value);
                    if (isNew) update("slug", generateSlug(e.target.value));
                  }}
                  placeholder="e.g. Signature City"
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Slug">
                <input
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  placeholder="property-slug"
                  className={inputCls}
                />
              </AdminField>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label="Status">
                <select value={form.status} onChange={(e) => update("status", e.target.value as Property["status"])} className={inputCls}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Property Type">
                <select value={form.propertyType} onChange={(e) => update("propertyType", e.target.value)} className={inputCls}>
                  <option>Land</option>
                  <option>Buildings</option>
                  <option>Shops</option>
                </select>
              </AdminField>
            </div>
            <AdminField label="Short Description">
              <textarea
                value={form.shortDescription}
                onChange={(e) => update("shortDescription", e.target.value)}
                rows={2}
                placeholder="Brief summary for cards and listings"
                className={inputCls}
              />
            </AdminField>
            <AdminField label="Full Description">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={5}
                placeholder="Detailed property description"
                className={inputCls}
              />
            </AdminField>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-[16px] font-bold text-[#09123c]">Property Details</h3>
            <p className="text-[13px] text-[#6b8aa0]">Location, pricing, and ownership details live together here.</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label="Location">
                <input
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. Omu ikoko"
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Price">
                <input
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="e.g. ₦5,000,000"
                  className={inputCls}
                />
              </AdminField>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <AdminField label="Plot Size">
                <input
                  value={form.plotSize}
                  onChange={(e) => update("plotSize", e.target.value)}
                  placeholder="e.g. 500 sqm"
                  className={inputCls}
                />
              </AdminField>
              <AdminField label="Availability">
                <input
                  value={form.availability}
                  onChange={(e) => update("availability", e.target.value)}
                  placeholder="e.g. Available"
                  className={inputCls}
                />
              </AdminField>
            </div>
            <AdminField label="Title / Documentation">
              <input
                value={form.titleDocumentation}
                onChange={(e) => update("titleDocumentation", e.target.value)}
                placeholder="e.g. Certificate of Occupancy"
                className={inputCls}
              />
            </AdminField>
            {/* Images — part of the property information */}
            <div className="border-t border-[#eef3f7] pt-5">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-[#09123c]">
                  Images <span className="font-semibold text-[#6b8aa0]">{form.gallery.length} / {MAX_IMAGES} images</span>
                </h4>
                {form.gallery.length > 0 && (
                  <span className="rounded-full bg-[#eaf4fc] px-3 py-1 text-[11px] font-bold text-[#09123c]">
                    First image is the main image
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-[#6b8aa0]">Upload up to 5 images.</p>
              {imageError && (
                <div role="alert" className="mt-3 rounded-lg border border-[#cc091b]/30 bg-[#cc091b]/5 px-4 py-3 text-[13px] font-medium text-[#cc091b]">
                  {imageError}
                </div>
              )}
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c8dce8] bg-[#f8fafc] px-4 py-6 text-center transition-colors hover:border-[#8ab5d6]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8ab5d6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span className="mt-2 text-[13px] font-bold text-[#09123c]">Upload images</span>
                <span className="mt-1 text-[12px] text-[#6b8aa0]">JPG, PNG, WEBP or SVG · max 1MB per file in this dev build · or add by URL below</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImageUrl();
                    }
                  }}
                  placeholder="/images/property.jpg or https://…"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={form.gallery.length >= MAX_IMAGES}
                  className="shrink-0 rounded-lg bg-[#09123c] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1a2a5e] disabled:opacity-40"
                >
                  Add URL
                </button>
              </div>
              {form.gallery.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {form.gallery.map((url, i) => {
                    const meta = imageMeta[url];
                    return (
                      <div key={`${url}-${i}`} className="flex items-center gap-3 rounded-lg border border-[#e3e9f0] bg-white p-2">
                        <div className="relative shrink-0">
                          <img src={url} alt={`Property image ${i + 1}`} className="h-14 w-14 rounded-md object-cover" />
                          {i === 0 && (
                            <span className="absolute -left-1 -top-1 rounded-full bg-[#09123c] px-1.5 py-px text-[9px] font-bold text-white">
                              Main
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-[#09123c]">
                            {meta?.name ?? basenameFromUrl(url)}
                          </div>
                          <div className="text-[12px] text-[#6b8aa0]">{meta?.size ?? "Linked URL"}</div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveImage(i, -1)}
                            disabled={i === 0}
                            className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c] disabled:opacity-30"
                            aria-label="Move image earlier"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(i, 1)}
                            disabled={i === form.gallery.length - 1}
                            className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-[#eaf4fc] hover:text-[#09123c] disabled:opacity-30"
                            aria-label="Move image later"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="rounded-lg p-1.5 text-[#6b8aa0] transition-colors hover:bg-red-50 hover:text-[#cc091b]"
                            aria-label={`Remove ${meta?.name ?? `image ${i + 1}`}`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-[#9db4c4]">No images yet (0/5). The first image becomes the main property image.</p>
              )}
              {mediaLibrary.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0]">Or pick from media library</h5>
                  <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {mediaLibrary.slice(0, 12).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (form.gallery.length >= MAX_IMAGES || form.gallery.includes(m.url)) return;
                          setImageMeta((prev) => ({ ...prev, [m.url]: { name: m.name, size: "Media library" } }));
                          const next = galleryWithFeatured([...form.gallery, m.url]);
                          setForm((prev) => ({ ...prev, ...next }));
                        }}
                        className="overflow-hidden rounded-lg border border-[#e3e9f0] transition-colors hover:border-[#8ab5d6]"
                        title={m.name}
                      >
                        <img src={m.url} alt={m.alt || m.name} className="h-14 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-[16px] font-bold text-[#09123c]">Features</h3>
            <div className="flex gap-2">
              <input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addFeature();
                  }
                }}
                placeholder="Add a feature (e.g. Gated Estate)"
                className={inputCls}
              />
              <button
                type="button"
                onClick={addFeature}
                className="shrink-0 rounded-lg bg-[#09123c] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1a2a5e]"
              >
                Add
              </button>
            </div>
            {form.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.features.map((feature, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf4fc] px-3 py-1.5 text-[13px] font-medium text-[#09123c]"
                  >
                    {feature}
                    <button
                      onClick={() => removeFeature(i)}
                      className="text-[#9db4c4] transition-colors hover:text-[#cc091b]"
                      aria-label={`Remove ${feature}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#9db4c4]">No features added yet.</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-[16px] font-bold text-[#09123c]">SEO</h3>
            <AdminField label="SEO Title">
              <input
                value={form.seoTitle}
                onChange={(e) => update("seoTitle", e.target.value)}
                placeholder="e.g. Signature City — Elforte"
                className={inputCls}
              />
            </AdminField>
            <AdminField label="Meta Description">
              <textarea
                value={form.metaDescription}
                onChange={(e) => update("metaDescription", e.target.value)}
                rows={3}
                placeholder="Brief description for search engines"
                className={inputCls}
              />
            </AdminField>
            <AdminField label="Social Image URL">
              <input
                value={form.socialImage}
                onChange={(e) => update("socialImage", e.target.value)}
                placeholder="/images/social.jpg"
                className={inputCls}
              />
            </AdminField>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="text-[16px] font-bold text-[#09123c]">Review & Publish</h3>
            <dl className="grid gap-4 rounded-lg border border-[#e3e9f0] bg-[#f8fafc] p-5 text-[13px] sm:grid-cols-2">
              <div>
                <dt className="font-bold text-[#09123c]">Property name</dt>
                <dd className="mt-1 text-[#4a556a]">{form.name || "—"}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#09123c]">Status</dt>
                <dd className="mt-1 text-[#4a556a]">{form.status}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold text-[#09123c]">Details</dt>
                <dd className="mt-1 text-[#4a556a]">
                  {[form.propertyType, form.price, form.plotSize, form.titleDocumentation, form.availability]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold text-[#09123c]">Location</dt>
                <dd className="mt-1 text-[#4a556a]">{form.location || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold text-[#09123c]">Images ({form.gallery.length}/{MAX_IMAGES})</dt>
                <dd className="mt-2 flex gap-2 overflow-x-auto">
                  {form.gallery.length === 0 && <span className="text-[#4a556a]">No images yet.</span>}
                  {form.gallery.map((url, i) => (
                    <img key={`${url}-${i}`} src={url} alt={`Review ${i + 1}`} className="h-16 w-24 rounded-lg object-cover" />
                  ))}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-bold text-[#09123c]">SEO</dt>
                <dd className="mt-1 text-[#4a556a]">
                  {[form.seoTitle, form.metaDescription, form.socialImage].filter(Boolean).join(" · ") || "—"}
                </dd>
              </div>
            </dl>
            <p className="text-[13px] text-[#6b8aa0]">
              Use Previous to go back and edit any step. Publishing makes an Available property visible on the website.
            </p>
          </div>
        )}

        {/* Bottom workflow navigation — all actions in one container */}
        <div className="mt-8 flex flex-col gap-3 border-t border-[#eef3f7] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/properties")}
            disabled={saving}
            className="w-full rounded-full border border-[#c8dce8] px-5 py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6] disabled:opacity-40 sm:w-auto"
          >
            Cancel
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 0 || saving}
              className="w-full rounded-full border border-[#c8dce8] px-5 py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6] disabled:opacity-40 sm:w-auto"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="w-full rounded-full border border-[#c8dce8] px-5 py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6] disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Saving…" : "Save as Draft"}
            </button>
            {step < lastStep ? (
              <button
                type="button"
                onClick={goNext}
                disabled={saving}
                className="w-full rounded-full bg-[#09123c] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#1a2a5e] disabled:opacity-60 sm:w-auto"
              >
                Next
              </button>
            ) : can("properties", "publish") ? (
              <button
                type="button"
                onClick={handlePublish}
                disabled={saving}
                className="w-full rounded-full bg-[#cc091b] px-5 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818] disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Saving…" : "Publish"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
