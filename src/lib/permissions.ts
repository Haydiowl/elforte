import { getCurrentUser } from "./auth";
import { getRoles, getStaff } from "./db";
import { OWNER_EMAIL, migratePermissions } from "./permissionDefs";

export { OWNER_EMAIL };

export function isOwner(): boolean {
  return getCurrentUser()?.email.toLowerCase() === OWNER_EMAIL;
}

export function getCurrentPermissions(): string[] {
  const user = getCurrentUser();
  if (!user) return [];
  if (user.email.toLowerCase() === OWNER_EMAIL) return ["*"];
  const staff = getStaff().find((s) => s.email.toLowerCase() === user.email.toLowerCase());
  const roleId = staff?.roleId ?? null;
  if (roleId) {
    const role = getRoles().find((r) => r.id === roleId);
    if (role) return migratePermissions(role.permissions);
  }
  // Back-compat: fall back to the role name stored in the session.
  const byName = getRoles().find((r) => r.name === user.role);
  return migratePermissions(byName?.permissions ?? []);
}

export function hasPermission(perm: string): boolean {
  const perms = getCurrentPermissions();
  return perms.includes("*") || perms.includes(perm);
}

export function can(module: string, action: string): boolean {
  return hasPermission(`${module}.${action}`);
}

/** Property scope: empty assignedPropertyIds means unrestricted. */
export function canAccessProperty(propertyId: string): boolean {
  if (isOwner()) return true;
  const user = getCurrentUser();
  if (!user) return false;
  const staff = getStaff().find((s) => s.email.toLowerCase() === user.email.toLowerCase());
  if (!staff) return false;
  if (!staff.assignedPropertyIds || staff.assignedPropertyIds.length === 0) return true;
  return staff.assignedPropertyIds.includes(propertyId);
}

/** Sidebar route → required view permission. Dashboard ("/admin") is always visible. */
export const ROUTE_PERMISSIONS: Record<string, string> = {
  "/admin/properties": "properties.view",
  "/admin/inquiries": "inquiries.view",
  "/admin/inspections": "inspections.view",
  "/admin/blog": "blog.view",
  "/admin/media": "media.view",
  "/admin/clients": "clients.view",
  "/admin/analytics": "analytics.view",
  "/admin/staff": "staff.view",
  "/admin/roles": "roles.view",
  "/admin/activity": "activity.view",
  "/admin/notifications": "notifications.view",
  "/admin/settings": "settings.view",
};

export function canAccessRoute(href: string): boolean {
  if (href === "/admin") return true;
  const perm = ROUTE_PERMISSIONS[href];
  if (!perm) return true;
  if (perm === "notifications.view") return true;
  return hasPermission(perm);
}
