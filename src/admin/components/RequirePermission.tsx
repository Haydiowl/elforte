import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { can } from "../../lib/permissions";

export default function RequirePermission({
  module,
  action = "view",
  children,
}: {
  module: string;
  action?: string;
  children: ReactNode;
}) {
  if (can(module, action)) return <>{children}</>;

  return (
    <div className="rounded-xl border border-[#e3e9f0] bg-white p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf4fc]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#09123c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>
      <h2 className="mt-4 text-[18px] font-bold text-[#09123c]">Access denied</h2>
      <p className="mx-auto mt-2 max-w-sm text-[14px] text-[#6b8aa0]">
        Your role does not include the {module}.{action} permission. Contact an administrator if you need access.
      </p>
      <Link
        to="/admin"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-[#cc091b] px-6 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-[#b50818]"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
