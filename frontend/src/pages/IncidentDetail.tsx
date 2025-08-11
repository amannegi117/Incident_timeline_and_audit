import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTimeline, createShareLink, fetchIncident, reviewIncident } from '../api/incidents'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import dayjs from 'dayjs'
import { marked } from 'marked'

export default function IncidentDetail() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: incident, isLoading, error } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => fetchIncident(id!, token),
    enabled: !!id,
  })

  const addTimelineMutation = useMutation({
    mutationFn: (content: string) => addTimeline(id!, content, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incident', id] }),
  })

  const reviewMutation = useMutation({
    mutationFn: (payload: { status: 'IN_REVIEW' | 'APPROVED' | 'REJECTED'; comment?: string }) =>
      reviewIncident(id!, payload.status as any, payload.comment, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incident', id] }),
  })

  const shareMutation = useMutation({
    mutationFn: (expiresAt: string) => createShareLink(id!, expiresAt, token),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'crimson' }}>{(error as any).message}</div>
  if (!incident) return null

  return (
    <div>
      <h2>{incident.title}</h2>
      <div className="card">
        <div>
          <span className="badge">{incident.severity}</span>
          <span className="badge">{incident.status}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          {incident.tags.map((t) => (
            <span key={t} className="badge">{t}</span>
          ))}
        </div>
        <div style={{ color: '#475569', marginTop: 8 }}>
          Created: {dayjs(incident.createdAt).format('YYYY-MM-DD HH:mm')}
        </div>
      </div>

      {/* Timeline */}
      <h3>Timeline</h3>
      <TimelineForm canAdd={user?.role === 'REPORTER'} onAdd={(c) => addTimelineMutation.mutate(c)} loading={addTimelineMutation.isPending} />
      {/* Placeholder: Backend returns timeline in incident detail include; if not, this can be extended. */}

      {/* Review */}
      {(user?.role === 'REVIEWER' || user?.role === 'ADMIN') && (
        <div className="card">
          <h3>Review</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="primary" onClick={() => reviewMutation.mutate({ status: 'IN_REVIEW' })}>Move to In Review</button>
            <button className="primary" onClick={() => reviewMutation.mutate({ status: 'APPROVED', comment })}>Approve</button>
            <button className="primary" onClick={() => reviewMutation.mutate({ status: 'REJECTED', comment })}>Reject</button>
            <input placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>
      )}

      {/* Share Link */}
      {user?.role === 'ADMIN' && (
        <div className="card">
          <h3>Create Share Link</h3>
          <ShareForm onCreate={(iso) => shareMutation.mutate(iso)} />
          {shareMutation.data && (
            <div style={{ marginTop: 8 }}>
              <div><strong>URL:</strong> <a href={shareMutation.data.url} target="_blank" rel="noreferrer">{shareMutation.data.url}</a></div>
              <div><strong>Expires:</strong> {dayjs(shareMutation.data.expiresAt).format('YYYY-MM-DD HH:mm')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TimelineForm({ canAdd, onAdd, loading }: { canAdd?: boolean; onAdd: (content: string) => void; loading: boolean }) {
  const [content, setContent] = useState('')
  if (!canAdd) return null
  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        if (!content.trim()) return
        onAdd(content)
        setContent('')
      }}
    >
      <label>Add Timeline Item (Markdown)</label>
      <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
      <button className="primary" type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
      <div style={{ marginTop: 8 }}>
        <div><strong>Preview</strong></div>
        <div className="card" dangerouslySetInnerHTML={{ __html: marked.parse(content || '') }} />
      </div>
    </form>
  )
}

function ShareForm({ onCreate }: { onCreate: (iso: string) => void }) {
  const [expires, setExpires] = useState<string>('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!expires) return
        const iso = new Date(expires).toISOString()
        onCreate(iso)
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
        <div style={{ flex: 1 }}>
          <label>Expires At</label>
          <input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} />
        </div>
        <button className="primary" type="submit">Create</button>
      </div>
    </form>
  )
}


