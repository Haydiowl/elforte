export const OWNER_EMAIL = "admin@elforte.com";

export interface ModuleDef {
  module: string;
  label: string;
  actions: string[];
}

export const PERMISSION_MODULES: ModuleDef[] = [
  { module: "properties", label: "Properties", actions: ["view", "create", "edit", "publish", "archive", "delete"] },
  { module: "blog", label: "Blog", actions: ["view", "create", "edit", "publish", "archive", "delete"] },
  { module: "clients", label: "Clients", actions: ["view", "create", "edit", "delete", "assign"] },
  { module: "inquiries", label: "Inquiries", actions: ["view", "create", "edit", "delete", "assign"] },
  { module: "inspections", label: "Inspections", actions: ["view", "create", "edit", "delete", "assign"] },
  { module: "analytics", label: "Analytics", actions: ["view", "export"] },
  { module: "media", label: "Media", actions: ["view", "create", "delete"] },
  { module: "staff", label: "Staff", actions: ["view", "create", "edit", "delete"] },
  { module: "roles", label: "Roles", actions: ["view", "create", "edit", "delete"] },
  { module: "activity", label: "Activity", actions: ["view", "export"] },
  { module: "settings", label: "Settings", actions: ["view", "edit"] },
];

const LEGACY_MAP: Record<string, string[]> = {
  "blog:read": ["blog.view"],
  "blog:write": ["blog.create", "blog.edit"],
  "media:read": ["media.view"],
  "media:write": ["media.create", "media.delete"],
  "clients:read": ["clients.view"],
  "clients:write": ["clients.create", "clients.edit"],
  "inquiries:read": ["inquiries.view"],
  "inquiries:write": ["inquiries.create", "inquiries.edit"],
  "inspections:read": ["inspections.view"],
  "inspections:write": ["inspections.create", "inspections.edit"],
};

const VALID = new Set<string>();
for (const m of PERMISSION_MODULES) {
  for (const a of m.actions) VALID.add(`${m.module}.${a}`);
}
VALID.add("*");

export function migratePermissions(perms: string[]): string[] {
  const out = new Set<string>();
  for (const p of perms) {
    if (p === "*") {
      out.add("*");
      continue;
    }
    if (LEGACY_MAP[p]) {
      for (const mapped of LEGACY_MAP[p]) out.add(mapped);
      continue;
    }
    if (VALID.has(p)) out.add(p);
  }
  return Array.from(out);
}

export function allPermissions(): string[] {
  const out: string[] = [];
  for (const m of PERMISSION_MODULES) {
    for (const a of m.actions) out.push(`${m.module}.${a}`);
  }
  return out;
}
