import type { ReactNode } from "react";

interface AdminTableProps {
  columns: { key: string; label: string; className?: string }[];
  children: ReactNode;
  emptyMessage?: string;
}

export default function AdminTable({ columns, children, emptyMessage = "No records found." }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#e3e9f0] bg-white ">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#e3e9f0] bg-[#f8fafc]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3.5 text-[12px] font-bold uppercase tracking-wider text-[#6b8aa0] ${col.className ?? ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f5f9]">{children}</tbody>
      </table>
      {emptyMessage && <div className="hidden">{emptyMessage}</div>}
    </div>
  );
}

export function AdminTableEmpty({ message, colSpan }: { message: string; colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center text-[14px] text-[#6b8aa0]">
        {message}
      </td>
    </tr>
  );
}
