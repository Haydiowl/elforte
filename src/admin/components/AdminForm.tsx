import type { ReactNode } from "react";

interface AdminFormProps {
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  onCancel?: () => void;
}

export default function AdminForm({
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  onCancel,
}: AdminFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-[#e3e9f0] bg-white p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-[#09123c]">{title}</h2>
        {description && <p className="mt-1 text-[14px] text-[#6b8aa0]">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
      <div className="mt-8 flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-[#cc091b] px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818] active:scale-95"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-full border border-[#c8dce8] px-6 py-2.5 text-[13px] font-bold text-[#09123c] transition-colors hover:border-[#8ab5d6]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function AdminField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[13px] font-semibold text-[#09123c]">{label}</label>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full rounded-lg border border-[#dce4ea] bg-white px-4 py-2.5 text-[14px] text-[#09123c] placeholder:text-[#9db4c4] outline-none transition-colors focus:border-[#8ab5d6] focus:ring-2 focus:ring-[#8ab5d6]/40";
