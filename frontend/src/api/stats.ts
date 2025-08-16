import { apiFetch } from './client'

export type StatsResponse = {
  totalUsers: number
  myIncidents: number
}

export async function fetchStats(token?: string | null) {
  return apiFetch<StatsResponse>('/stats', {}, token)
}