import { useQuery } from '@tanstack/react-query'
import { fetchIncidents, type Incident } from '../api/incidents'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { token, user } = useAuth()

  const { data: stats } = useQuery<{ totalUsers: number; myIncidents: number }>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/stats', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      if (!res.ok) throw new Error('Failed to load stats')
      return res.json()
    },
    enabled: !!token,
  })

   const { data: incidents } = useQuery({
    queryKey: ['incidents', { dashboard: true }],
    queryFn: () => fetchIncidents({ page: 1, limit: 10 }, token),
    enabled: !!token,
  })

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="list" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        <div className="card">
          <div style={{ color: '#6b7280' }}>Total Users</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.totalUsers ?? '—'}</div>
        </div>
        <div className="card">
          <div style={{ color: '#6b7280' }}>My Incidents</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats?.myIncidents ?? '—'}</div>
        </div>
      </div>

  <h3 style={{ marginTop: 12 }}>Recent Incidents</h3>
      <div className="list">
        {incidents?.data.map((inc: Incident) => (
          <div key={inc.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Link to={`/incidents/${inc.id}`}><strong>{inc.title}</strong></Link>
                <div>
                  <span className="badge">{inc.severity}</span>
                  <span className="badge">{inc.status}</span>
                  {inc.tags.map((t) => (
                    <span key={t} className="badge">{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ color: '#6b7280' }}>{new Date(inc.createdAt).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}