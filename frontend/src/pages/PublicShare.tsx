import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchSharedIncident } from '../api/incidents'
import dayjs from 'dayjs'

export default function PublicShare() {
  const { token } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: ['share', token],
    queryFn: () => fetchSharedIncident(token!),
    enabled: !!token,
  })

  if (isLoading) return <div className="container">Loading...</div>
  if (error) return <div className="container" style={{ color: 'crimson' }}>{(error as any).message}</div>
  if (!data) return null

  return (
    <div className="container">
      <h2>{data.title}</h2>
      <div className="card">
        <div>
          <span className="badge">{data.severity}</span>
          <span className="badge">{data.status}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          {data.tags?.map((t: string) => (
            <span key={t} className="badge">{t}</span>
          ))}
        </div>
        <div style={{ color: '#475569', marginTop: 8 }}>
          Created: {dayjs(data.createdAt).format('YYYY-MM-DD HH:mm')}
        </div>
      </div>

      {/* Could render timeline and reviews if included by API */}
    </div>
  )
}


