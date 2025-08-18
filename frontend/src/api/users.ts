import { apiFetch } from "./client";

export type MeResponse = {
  id: string;
  email: string;
  role: "REPORTER" | "REVIEWER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  _count: {
    createdIncidents: number;
    timelineEvents: number;
    reviews: number;
    shareLinks: number;
  };
  createdIncidents: Array<{
    id: string;
    title: string;
    severity: "P1" | "P2" | "P3" | "P4";
    status: "OPEN" | "IN_REVIEW" | "APPROVED" | "REJECTED";
    createdAt: string;
  }>;
};

export async function fetchMe(token?: string | null) {
  return apiFetch<MeResponse>("/users/me", {}, token);
}
