import type {
  Activity,
  Blog,
  Client,
  Inspection,
  Inquiry,
  Media,
  Notification,
  Property,
  Role,
  Settings,
  Staff,
} from "./types";
import { properties } from "../data/properties";
import { articles } from "../data/articles";
import { migratePermissions } from "./permissionDefs";
import { getCurrentUser } from "./auth";

const KEYS = {
  properties: "elforte_properties",
  blog: "elforte_blog",
  clients: "elforte_clients",
  inquiries: "elforte_inquiries",
  inspections: "elforte_inspections",
  staff: "elforte_staff",
  roles: "elforte_roles",
  activity: "elforte_activity",
  notifications: "elforte_notifications",
  media: "elforte_media",
  settings: "elforte_settings",
  version: "elforte_data_version",
} as const;

const CURRENT_VERSION = 1;

function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently
  }
}

function getCollection<T>(key: string): T[] {
  const data = safeGet<unknown[]>(key, []);
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is T => item !== null && typeof item === "object");
}

function saveCollection<T>(key: string, items: T[]): void {
  safeSet(key, items);
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

function seedProperties(): Property[] {
  return properties.map((p) => ({
    id: p.slug,
    name: p.displayName,
    slug: p.slug,
    status: p.status === "closed" ? ("Closed" as const) : ("Available" as const),
    propertyType: p.landType,
    shortDescription: p.description,
    description: p.longDescription,
    location: p.location,
    price: "",
    plotSize: "",
    titleDocumentation: "",
    availability: p.statusLabel,
    features: [],
    featuredImage: p.image,
    gallery: [],
    mapCoordinates: null,
    seoTitle: "",
    metaDescription: "",
    socialImage: p.image,
    views: 0,
    inquiryCount: 0,
    createdAt: now(),
    updatedAt: now(),
    detail: p.detail,
  }));
}

function seedBlog(): Blog[] {
  return articles.map((a) => ({
    id: a.slug,
    title: a.title,
    slug: a.slug,
    category: a.tag,
    excerpt: a.excerpt,
    featuredImage: a.image,
    content: a.body.join("\n\n"),
    author: "",
    status: "Published" as const,
    seoTitle: "",
    seoDescription: "",
    socialImage: a.image,
    views: 0,
    publishedAt: a.date ?? now(),
    createdAt: now(),
    updatedAt: now(),
  }));
}

function seedRoles(): Role[] {
  const ts = now();
  return [
    {
      id: "role_admin",
      name: "Administrator",
      description: "Full access to all admin features",
      permissions: ["*"],
      isSystemRole: true,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: "role_editor",
      name: "Editor",
      description: "Can manage blog and media",
      permissions: ["blog.view", "blog.create", "blog.edit", "blog.publish", "media.view", "media.create"],
      isSystemRole: true,
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: "role_sales",
      name: "Sales",
      description: "Can manage clients, inquiries, and inspections",
      permissions: [
        "properties.view",
        "clients.view",
        "inquiries.view",
        "inquiries.create",
        "inquiries.edit",
        "inspections.view",
        "inspections.create",
        "inspections.edit",
      ],
      isSystemRole: true,
      createdAt: ts,
      updatedAt: ts,
    },
  ];
}

function seedSettings(): Settings {
  return {
    siteName: "Elforte",
    siteDescription:
      "Explore thoughtfully developed properties, secure your ideal plot, and take your next step toward property ownership with clarity and confidence.",
    contactEmail: "elforteglobalresourcelimited@gmail.com",
    contactPhone: "+234 81234567879",
    contactAddress: "Ijebu Ode, Ogun State",
    socialLinks: {
      twitter: "https://x.com/elforte",
      linkedin: "https://linkedin.com/company/elforte",
      instagram: "https://instagram.com/elforte",
    },
    seoDefaults: {
      titleSuffix: "— Elforte",
      defaultDescription:
        "Elforte offers thoughtfully planned residential estates with clear documentation and flexible payment options.",
    },
    updatedAt: now(),
  };
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

let initialized = false;

export function initDB(): void {
  if (initialized) return;
  initialized = true;

  const hasProperties = getCollection<Property>(KEYS.properties).length > 0;
  const hasBlog = getCollection<Blog>(KEYS.blog).length > 0;
  const hasRoles = getCollection<Role>(KEYS.roles).length > 0;
  const hasSettings = localStorage.getItem(KEYS.settings) !== null;

  if (!hasProperties) {
    saveCollection(KEYS.properties, seedProperties());
  }
  if (!hasBlog) {
    saveCollection(KEYS.blog, seedBlog());
  }
  if (!hasRoles) {
    saveCollection(KEYS.roles, seedRoles());
  } else {
    // Migrate legacy permission strings (e.g. "blog:write") to module.action form.
    const stored = getCollection<Role>(KEYS.roles);
    let changed = false;
    const migrated = stored.map((r) => {
      const next = migratePermissions(r.permissions);
      if (next.length !== r.permissions.length || next.some((p, i) => p !== r.permissions[i])) {
        changed = true;
        return { ...r, permissions: next };
      }
      return r;
    });
    if (changed) saveCollection(KEYS.roles, migrated);
  }
  if (!hasSettings) {
    safeSet(KEYS.settings, seedSettings());
  }

  saveCollection(KEYS.clients, getCollection(KEYS.clients));
  saveCollection(KEYS.inquiries, getCollection(KEYS.inquiries));
  saveCollection(KEYS.inspections, getCollection(KEYS.inspections));
  saveCollection(KEYS.staff, getCollection(KEYS.staff));
  saveCollection(KEYS.activity, getCollection(KEYS.activity));
  saveCollection(KEYS.notifications, getCollection(KEYS.notifications));
  saveCollection(KEYS.media, getCollection(KEYS.media));

  safeSet(KEYS.version, CURRENT_VERSION);
}

// ---------------------------------------------------------------------------
// Properties
// ---------------------------------------------------------------------------

export function getProperties(): Property[] {
  return getCollection<Property>(KEYS.properties);
}

export function getProperty(id: string): Property | undefined {
  return getProperties().find((p) => p.id === id);
}

export function createProperty(data: Omit<Property, "id" | "createdAt" | "updatedAt">): Property {
  const property: Property = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
  const all = getProperties();
  all.push(property);
  saveCollection(KEYS.properties, all);
  logActivity("property created", "property", property.id, { name: property.name });
  return property;
}

export function saveProperty(property: Property): void {
  const all = getProperties();
  const idx = all.findIndex((p) => p.id === property.id);
  if (idx === -1) {
    all.push(property);
  } else {
    all[idx] = { ...property, updatedAt: now() };
  }
  saveCollection(KEYS.properties, all);
}

export function updateProperty(id: string, updates: Partial<Property>): Property | undefined {
  const all = getProperties();
  const idx = all.findIndex((p) => p.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...updates, id, updatedAt: now() };
  saveCollection(KEYS.properties, all);
  logActivity(updates.status === "Available" ? "property published" : "property edited", "property", id, { updates });
  if (updates.status === "Available") {
    createNotification({
      userId: getCurrentUser()?.email ?? "system",
      type: "property_published",
      title: "Property published",
      message: `A property is now live.`,
      entityType: "property",
      entityId: id,
      read: false,
    });
  }
  return all[idx];
}

export function deleteProperty(id: string): void {
  saveCollection(
    KEYS.properties,
    getProperties().filter((p) => p.id !== id)
  );
  logActivity("property deleted", "property", id);
}

export function archiveProperty(id: string): Property | undefined {
  const result = updateProperty(id, { status: "Archived" });
  logActivity("property archived", "property", id);
  return result;
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export function getArticles(): Blog[] {
  return getCollection<Blog>(KEYS.blog);
}

export function getArticle(id: string): Blog | undefined {
  return getArticles().find((a) => a.id === id);
}

export function createArticle(data: Omit<Blog, "id" | "createdAt" | "updatedAt">): Blog {
  const article: Blog = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
  const all = getArticles();
  all.push(article);
  saveCollection(KEYS.blog, all);
  logActivity("blog created", "blog", article.id, { title: article.title });
  return article;
}

export function saveArticle(article: Blog): void {
  const all = getArticles();
  const idx = all.findIndex((a) => a.id === article.id);
  if (idx === -1) {
    all.push(article);
  } else {
    all[idx] = { ...article, updatedAt: now() };
  }
  saveCollection(KEYS.blog, all);
}

export function updateArticle(id: string, updates: Partial<Blog>): Blog | undefined {
  const all = getArticles();
  const idx = all.findIndex((a) => a.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...updates, id, updatedAt: now() };
  saveCollection(KEYS.blog, all);
  logActivity(updates.status === "Published" ? "blog published" : "blog edited", "blog", id, { updates });
  if (updates.status === "Published") {
    createNotification({
      userId: getCurrentUser()?.email ?? "system",
      type: "blog_published",
      title: "Blog published",
      message: `A blog post is now live.`,
      entityType: "blog",
      entityId: id,
      read: false,
    });
  }
  return all[idx];
}

export function deleteArticle(id: string): void {
  saveCollection(
    KEYS.blog,
    getArticles().filter((a) => a.id !== id)
  );
  logActivity("blog deleted", "blog", id);
}

export function archiveArticle(id: string): Blog | undefined {
  const result = updateArticle(id, { status: "Archived" });
  logActivity("blog deleted", "blog", id);
  return result;
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export function getClients(): Client[] {
  return getCollection<Client>(KEYS.clients);
}

export function getClient(id: string): Client | undefined {
  return getClients().find((c) => c.id === id);
}

export function createClient(data: Omit<Client, "id" | "createdAt" | "updatedAt" | "lastActivityAt">): Client {
  const client: Client = { ...data, id: generateId(), createdAt: now(), updatedAt: now(), lastActivityAt: now() };
  const all = getClients();
  all.push(client);
  saveCollection(KEYS.clients, all);
  logActivity("client created", "client", client.id, { name: client.name });
  return client;
}

export function updateClient(id: string, updates: Partial<Client>): Client | undefined {
  const all = getClients();
  const idx = all.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...updates, id, updatedAt: now(), lastActivityAt: now() };
  saveCollection(KEYS.clients, all);
  logActivity("client updated", "client", id, { updates });
  if (updates.assignedStaffId) {
    createNotification({
      userId: getCurrentUser()?.email ?? "system",
      type: "client_assigned",
      title: "Client assigned",
      message: `A client has been assigned to a staff member.`,
      entityType: "client",
      entityId: id,
      read: false,
    });
  }
  return all[idx];
}

export function deleteClient(id: string): void {
  saveCollection(
    KEYS.clients,
    getClients().filter((c) => c.id !== id)
  );
  logActivity("client updated", "client", id);
}

// ---------------------------------------------------------------------------
// Inquiries
// ---------------------------------------------------------------------------

export function getInquiries(): Inquiry[] {
  return getCollection<Inquiry>(KEYS.inquiries);
}

export function getInquiry(id: string): Inquiry | undefined {
  return getInquiries().find((i) => i.id === id);
}

export function createInquiry(data: Omit<Inquiry, "id" | "createdAt" | "updatedAt">): Inquiry {
  const inquiry: Inquiry = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
  const all = getInquiries();
  all.push(inquiry);
  saveCollection(KEYS.inquiries, all);
  logActivity("inquiry assigned", "inquiry", inquiry.id, { source: inquiry.source });
  createNotification({
    userId: getCurrentUser()?.email ?? "system",
    type: "new_inquiry",
    title: "New property inquiry",
    message: `Source: ${inquiry.source}`,
    entityType: "inquiry",
    entityId: inquiry.id,
    read: false,
  });
  return inquiry;
}

export function updateInquiry(id: string, updates: Partial<Inquiry>): Inquiry | undefined {
  const all = getInquiries();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...updates, id, updatedAt: now() };
  saveCollection(KEYS.inquiries, all);
  logActivity("inquiry assigned", "inquiry", id, { updates });
  return all[idx];
}

export function deleteInquiry(id: string): void {
  saveCollection(
    KEYS.inquiries,
    getInquiries().filter((i) => i.id !== id)
  );
  logActivity("inquiry assigned", "inquiry", id);
}

// ---------------------------------------------------------------------------
// Inspections
// ---------------------------------------------------------------------------

export function getInspections(): Inspection[] {
  return getCollection<Inspection>(KEYS.inspections);
}

export function getInspection(id: string): Inspection | undefined {
  return getInspections().find((i) => i.id === id);
}

export function createInspection(data: Omit<Inspection, "id" | "createdAt" | "updatedAt">): Inspection {
  const inspection: Inspection = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
  const all = getInspections();
  all.push(inspection);
  saveCollection(KEYS.inspections, all);
  logActivity("inspection created", "inspection", inspection.id);
  createNotification({
    userId: getCurrentUser()?.email ?? "system",
    type: "new_inspection",
    title: "New inspection scheduled",
    message: `Date: ${inspection.date}`,
    entityType: "inspection",
    entityId: inspection.id,
    read: false,
  });
  return inspection;
}

export function updateInspection(id: string, updates: Partial<Inspection>): Inspection | undefined {
  const all = getInspections();
  const idx = all.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...updates, id, updatedAt: now() };
  saveCollection(KEYS.inspections, all);
  logActivity("inspection created", "inspection", id, { updates });
  if (updates.outcome === "Follow-up Required") {
    createNotification({
      userId: getCurrentUser()?.email ?? "system",
      type: "follow_up_required",
      title: "Follow-up required",
      message: `An inspection requires follow-up.`,
      entityType: "inspection",
      entityId: id,
      read: false,
    });
  }
  return all[idx];
}

export function deleteInspection(id: string): void {
  saveCollection(
    KEYS.inspections,
    getInspections().filter((i) => i.id !== id)
  );
  logActivity("inspection created", "inspection", id);
}

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

export function getStaff(): Staff[] {
  return getCollection<Staff>(KEYS.staff);
}

export function getStaffMember(id: string): Staff | undefined {
  return getStaff().find((s) => s.id === id);
}

export function createStaffMember(data: Omit<Staff, "id" | "createdAt" | "lastLogin">): Staff {
  const member: Staff = { ...data, id: generateId(), createdAt: now(), lastLogin: null };
  const all = getStaff();
  all.push(member);
  saveCollection(KEYS.staff, all);
  logActivity("staff created", "staff", member.id, { name: `${member.firstName} ${member.lastName}` });
  createNotification({
    userId: getCurrentUser()?.email ?? "system",
    type: "staff_invited",
    title: "New staff invitation",
    message: `${member.firstName} ${member.lastName} has been invited.`,
    entityType: "staff",
    entityId: member.id,
    read: false,
  });
  return member;
}

export function updateStaffMember(id: string, updates: Partial<Staff>): Staff | undefined {
  const all = getStaff();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...updates, id };
  saveCollection(KEYS.staff, all);
  logActivity(updates.status === "Suspended" ? "staff suspended" : "staff created", "staff", id, { updates });
  return all[idx];
}

export function deleteStaffMember(id: string): void {
  saveCollection(
    KEYS.staff,
    getStaff().filter((s) => s.id !== id)
  );
  logActivity("staff created", "staff", id);
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export function getRoles(): Role[] {
  return getCollection<Role>(KEYS.roles);
}

export function getRole(id: string): Role | undefined {
  return getRoles().find((r) => r.id === id);
}

export function createRole(data: Omit<Role, "id" | "createdAt" | "updatedAt">): Role {
  const role: Role = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
  const all = getRoles();
  all.push(role);
  saveCollection(KEYS.roles, all);
  logActivity("role changed", "role", role.id, { name: role.name });
  return role;
}

export function updateRole(id: string, updates: Partial<Role>): Role | undefined {
  const all = getRoles();
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...updates, id, updatedAt: now() };
  saveCollection(KEYS.roles, all);
  logActivity("role changed", "role", id, { updates });
  return all[idx];
}

export function deleteRole(id: string): void {
  saveCollection(
    KEYS.roles,
    getRoles().filter((r) => r.id !== id)
  );
  logActivity("role changed", "role", id);
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

export function getActivities(): Activity[] {
  return getCollection<Activity>(KEYS.activity);
}

export function createActivity(data: Omit<Activity, "id" | "timestamp">): Activity {
  const activity: Activity = { ...data, id: generateId(), timestamp: now() };
  const all = getActivities();
  all.push(activity);
  saveCollection(KEYS.activity, all);
  return activity;
}

function logActivity(action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>): void {
  const user = getCurrentUser();
  createActivity({
    userId: user?.email ?? "system",
    action,
    entityType,
    entityId,
    metadata: metadata ?? {},
  });
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function getNotifications(userId: string): Notification[] {
  return getCollection<Notification>(KEYS.notifications).filter((n) => n.userId === userId);
}

export function createNotification(data: Omit<Notification, "id" | "createdAt">): Notification {
  const notification: Notification = { ...data, id: generateId(), createdAt: now() };
  const all = getCollection<Notification>(KEYS.notifications);
  all.push(notification);
  saveCollection(KEYS.notifications, all);
  return notification;
}

export function markNotificationRead(id: string): void {
  const all = getCollection<Notification>(KEYS.notifications);
  const idx = all.findIndex((n) => n.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], read: true };
    saveCollection(KEYS.notifications, all);
  }
}

export function markAllNotificationsRead(userId: string): void {
  const all = getCollection<Notification>(KEYS.notifications);
  let changed = false;
  for (let i = 0; i < all.length; i++) {
    if (all[i].userId === userId && !all[i].read) {
      all[i] = { ...all[i], read: true };
      changed = true;
    }
  }
  if (changed) saveCollection(KEYS.notifications, all);
}

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export function getMedia(): Media[] {
  return getCollection<Media>(KEYS.media);
}

export function saveMedia(data: Omit<Media, "id" | "createdAt" | "updatedAt">): Media {
  const media: Media = { ...data, id: generateId(), createdAt: now(), updatedAt: now() };
  const all = getMedia();
  all.push(media);
  saveCollection(KEYS.media, all);
  return media;
}

export function deleteMedia(id: string): void {
  saveCollection(
    KEYS.media,
    getMedia().filter((m) => m.id !== id)
  );
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export function getSettings(): Settings {
  return safeGet<Settings>(KEYS.settings, seedSettings());
}

export function saveSettings(settings: Settings): void {
  safeSet(KEYS.settings, { ...settings, updatedAt: now() });
  logActivity("settings changed", "settings", "site");
}
