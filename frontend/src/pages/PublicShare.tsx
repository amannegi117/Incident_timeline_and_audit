import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchSharedIncident } from '../api/incidents'
import dayjs from 'dayjs'
import { marked } from 'marked'

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

      <h3>Timeline</h3>
      <div className="list">
        {data.timelineEvents?.map((ev: any) => (
          <div key={ev.id} className="card">
            <div className="small-muted">
              By {ev.creator?.email || ev.createdBy} on {dayjs(ev.createdAt).format('YYYY-MM-DD HH:mm')}
            </div>
            <div style={{ marginTop: 8 }} className="card" dangerouslySetInnerHTML={{ __html: marked.parse(ev.content || '') }} />
          </div>
        ))}
      </div>

      {data.reviews && data.reviews.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <h3>Reviews</h3>
          <div className="list">
            {data.reviews.map((r: any) => (
              <div key={r.id} className="card">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="badge">{r.status}</span>
                  <span className="small-muted">by {r.reviewer?.email || r.reviewedBy} on {dayjs(r.reviewedAt).format('YYYY-MM-DD HH:mm')}</span>
                </div>
                {r.comment && (
                  <div style={{ marginTop: 8 }}>{r.comment}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


