export type PropertyStatus =
  | "Draft"
  | "Available"
  | "Under Offer"
  | "Sold"
  | "Closed"
  | "Archived";

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface Property {
  id: string;
  name: string;
  slug: string;
  status: PropertyStatus;
  propertyType: string;
  shortDescription: string;
  description: string;
  location: string;
  price: string;
  plotSize: string;
  titleDocumentation: string;
  availability: string;
  features: string[];
  featuredImage: string;
  gallery: string[];
  mapCoordinates: MapCoordinates | null;
  seoTitle: string;
  metaDescription: string;
  socialImage: string;
  views: number;
  inquiryCount: number;
  createdAt: string;
  updatedAt: string;
  detail?: PropertyDetail;
}

export interface PropertyDetail {
  heroImage: string;
  aboutTitle: string;
  about: string[];
  whyTitle: string;
  why: { heading: string; text: string }[];
  whoTitle: string;
  whoIntro: string;
  who: string[];
  moveTitle: string;
  move: string[];
}

export type BlogStatus = "Draft" | "Published" | "Scheduled" | "Archived";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  featuredImage: string;
  content: string;
  author: string;
  status: BlogStatus;
  seoTitle: string;
  seoDescription: string;
  socialImage: string;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ClientStatus =
  | "New"
  | "Contacted"
  | "Interested"
  | "Inspection Scheduled"
  | "Purchased"
  | "Not Interested"
  | "Lost";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: ClientStatus;
  assignedStaffId: string | null;
  interestedPropertyIds: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export type InquiryStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Inspection Scheduled"
  | "Converted"
  | "Closed"
  | "Lost";

export interface Inquiry {
  id: string;
  clientId: string | null;
  propertyId: string | null;
  message: string;
  source: string;
  status: InquiryStatus;
  assignedStaffId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InspectionStatus =
  | "Scheduled"
  | "Confirmed"
  | "Completed"
  | "Rescheduled"
  | "Cancelled";

export type InspectionOutcome =
  | "Interested"
  | "Follow-up Required"
  | "Not Interested"
  | "Purchased";

export interface Inspection {
  id: string;
  clientId: string;
  propertyId: string;
  date: string;
  time: string;
  assignedStaffId: string | null;
  status: InspectionStatus;
  notes: string;
  outcome: InspectionOutcome | null;
  createdAt: string;
  updatedAt: string;
}

export type StaffStatus = "Active" | "Invited" | "Suspended";

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: string | null;
  assignedPropertyIds: string[];
  status: StaffStatus;
  createdAt: string;
  lastLogin: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  read: boolean;
  createdAt: string;
}

export interface Media {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialLinks: {
    twitter: string;
    linkedin: string;
    instagram: string;
  };
  seoDefaults: {
    titleSuffix: string;
    defaultDescription: string;
  };
  updatedAt: string;
}
