import { apiFetch } from './client'

export type Incident = {
  id: string
  title: string
  severity: 'P1' | 'P2' | 'P3' | 'P4'
  status: 'OPEN' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string,
    creator?: { id: string; email: string }
  timelineEvents?: Array<{
    id: string
    content: string
    createdBy: string
    createdAt: string
    creator?: { id: string; email: string }
  }>
  reviews?: Array<{
    id: string
    status: Incident['status']
    comment?: string
    reviewedBy: string
    reviewedAt: string
    reviewer?: { id: string; email: string }
  }>
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

export async function updateIncident(id: string, data: Partial<Incident> & { createdAt?: string }, token?: string | null) {
  return apiFetch<Incident>(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token)
}

export async function deleteIncident(id: string, token?: string | null) {
  return apiFetch(`/incidents/${id}`, { method: 'DELETE' }, token)
}

export async function revokeShareLink(id: string, tokenOrUrl: string, authToken?: string | null) {
  let token = (tokenOrUrl || '').trim()
  try {
    if (token.startsWith('http')) {
      const u = new URL(token)
      const parts = u.pathname.split('/').filter(Boolean)
      token = parts[parts.length - 1] || token
    } else if (token.includes('/')) {
      const parts = token.split('/').filter(Boolean)
      token = parts[parts.length - 1]
    }
  } catch {}
  return apiFetch<void>(`/share/${id}/share/${token}`, { method: 'DELETE' }, authToken)
}