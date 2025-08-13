import { apiFetch } from './client'

export type Incident = {
  id: string
  title: string
  severity: 'P1' | 'P2' | 'P3' | 'P4'
  status: 'OPEN' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type ShareLinkResponse = {
  id: string
  token: string
  url: string
  expiresAt: string
  createdAt: string
}

export type IncidentListResponse = {
  data: Incident[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export async function fetchIncidents(params: Record<string, any>, token?: string | null) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    if (Array.isArray(v)) v.forEach((item) => qs.append(k, String(item)))
    else qs.append(k, String(v))
  })
  return apiFetch<IncidentListResponse>(`/incidents?${qs.toString()}`, {}, token)
}

export async function fetchIncident(id: string, token?: string | null) {
  return apiFetch<Incident>(`/incidents/${id}`, {}, token)
}

export async function createIncident(data: { title: string; severity: Incident['severity']; tags: string[] }, token?: string | null) {
  return apiFetch<Incident>(`/incidents`, { method: 'POST', body: JSON.stringify(data) }, token)
}

export async function addTimeline(id: string, content: string, token?: string | null) {
  return apiFetch(`/incidents/${id}/timeline`, { method: 'POST', body: JSON.stringify({ content }) }, token)
}

export async function reviewIncident(id: string, status: Incident['status'], comment?: string, token?: string | null) {
  return apiFetch(`/incidents/${id}/review`, { method: 'POST', body: JSON.stringify({ status, comment }) }, token)
}

export async function createShareLink(id: string, expiresAt: string, token?: string | null) {
  return apiFetch<ShareLinkResponse>(`/incidents/${id}/share`, { method: 'POST', body: JSON.stringify({ expiresAt }) }, token)
}

export async function fetchSharedIncident(tokenParam: string) {
  return apiFetch<Incident>(`/share/${tokenParam}`)
}


