// Auth-related shared types

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "user" | "admin";
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: string | null;
  createdAt: Date;
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  createdAt: Date;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "member";
  status: "pending" | "accepted" | "rejected" | "canceled";
  expiresAt: Date;
  inviterId: string;
  createdAt: Date;
}

export interface AuthSession {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  impersonatedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
