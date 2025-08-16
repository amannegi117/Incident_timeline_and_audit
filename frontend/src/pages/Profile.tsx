import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const { user, token } = useAuth()

  const { data } = useQuery<{ id: string; email: string; role: string; incidentCount: number }>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/users/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      if (!res.ok) throw new Error('Failed to load profile')
      return res.json()
    },
    enabled: !!token,
  })

  return (
    <div>
      <h2>Profile</h2>
      <div className="card" style={{ display: 'grid', gap: 8 }}>
        <div><strong>Name</strong>: {data?.email?.split('@')[0]}</div>
        <div><strong>Email</strong>: {data?.email}</div>
        <div><strong>Role</strong>: {data?.role}</div>
        <div><strong>Incidents Reported</strong>: {data?.incidentCount ?? '—'}</div>
      </div>
    </div>
  )
}