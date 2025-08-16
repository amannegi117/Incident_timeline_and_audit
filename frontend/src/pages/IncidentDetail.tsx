import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addTimeline, createShareLink, fetchIncident, reviewIncident, revokeShareLink, type ShareLinkResponse, updateIncident,  deleteIncident as deleteIncidentApi } from '../api/incidents'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import dayjs from 'dayjs'
import { marked } from 'marked'
import { useToast } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'

export default function IncidentDetail() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const qc = useQueryClient()
  const [comment, setComment] = useState('')
  const { show, node } = useToast()
  const navigate = useNavigate()
  const [createdByInput, setCreatedByInput] = useState('')
  const [createdAtInput, setCreatedAtInput] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

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
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['incident', id] })
      if (vars.status === 'IN_REVIEW') show('Incident moved to In Review')
      if (vars.status === 'APPROVED') show('Incident approved')
      if (vars.status === 'REJECTED') show('Incident rejected')
    },
  })

  const shareMutation = useMutation<ShareLinkResponse, Error, string>({
    mutationFn: (expiresAt) => createShareLink(id!, expiresAt, token),
    onSuccess: () => show('Share link created'),
  })

    const deleteMutation = useMutation({
    mutationFn: () => deleteIncidentApi(id!, token),
    onSuccess: () => {
      show('Incident deleted')
      qc.invalidateQueries({ queryKey: ['incidents'] })
      qc.invalidateQueries({ queryKey: ["stats"] });
      navigate('/incidents')
    }
  })
const updateMutation = useMutation({
  mutationFn: (payload: { createdBy?: string; createdAt?: string }) => updateIncident(id!, payload, token),
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ['incident', id] })
    show('Incident updated')
  },
})

const revokeMutation = useMutation({
  mutationFn: (shareToken: string) => revokeShareLink(id!, shareToken, token),
  onSuccess: () => show('Share link revoked'),
})

const [revokeToken, setRevokeToken] = useState('')

  if (isLoading) return <div>Loading...</div>
  if (error) return <div style={{ color: 'crimson' }}>{(error as any).message}</div>
  if (!incident) return null

  const canMoveToReview = (user?.role === 'REVIEWER' || user?.role === 'ADMIN') && incident.status === 'OPEN'
  const canApproveReject = (user?.role === 'REVIEWER' || user?.role === 'ADMIN') && incident.status === 'IN_REVIEW'

  async function downloadPdf() {
    try {
      const res = await fetch(`/incidents/${id}/postmortem.pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Failed to download PDF')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `incident-${id}-postmortem.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      show('Failed to export PDF')
    }
  }

  return (
    <div>
      {node}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete this incident?"
        message="This action cannot be undone."
        confirmText={deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
        isConfirmDisabled={deleteMutation.isPending}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{incident.title}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="primary" onClick={downloadPdf}>Export PDF</button>
          {user?.role === 'ADMIN' && (
            <button className="primary" onClick={() => setConfirmOpen(true)}>Delete</button>
          )}
        </div>
      </div>
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

      {/* Review */}
      {(user?.role === 'REVIEWER' || user?.role === 'ADMIN') && (
        <div className="card">
          <h3>Review</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {canMoveToReview && (
              <button className="primary" onClick={() => reviewMutation.mutate({ status: 'IN_REVIEW' })}>Move to In Review</button>
            )}
            {canApproveReject && (
              <>
                <button className="primary" onClick={() => reviewMutation.mutate({ status: 'APPROVED', comment })}>Approve</button>
                <button className="primary" onClick={() => reviewMutation.mutate({ status: 'REJECTED', comment })}>Reject</button>
                <input placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
              </>
            )}
          </div>
        </div>
      )}

      {/* Share Link */}
{user?.role === 'ADMIN' && (
  <div className="card">
    <h3>Create Share Link</h3>
    <ShareForm onCreate={(iso) => shareMutation.mutate(iso)} />
    {shareMutation.data ? (
      <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
        <div>
          <strong>URL:</strong>{' '}
          <a href={shareMutation.data.url} target="_blank" rel="noreferrer">
            {shareMutation.data.url}
          </a>
        </div>
        <div>
          <strong>Expires:</strong>{' '}
          {dayjs(shareMutation.data.expiresAt).format('YYYY-MM-DD HH:mm')}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            className="primary"
            type="button"
            onClick={() => revokeMutation.mutate(shareMutation.data.token)}
          >
            {revokeMutation.isPending ? 'Revoking...' : 'Revoke'}
          </button>
          {dayjs().isBefore(dayjs(shareMutation.data.expiresAt)) && (
            <span className="small-muted">Link not expired yet</span>
          )}
        </div>
      </div>
    ) : null}
  </div>
)}

      {/* Edit Incident Metadata */}
      {(user?.role === 'REPORTER' && incident.status === 'OPEN' && incident.createdBy === user?.id) && (
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault()
            const payload: { createdBy?: string; createdAt?: string } = {}
            if (createdByInput && createdByInput !== incident.createdBy) payload.createdBy = createdByInput
            if (createdAtInput) payload.createdAt = new Date(createdAtInput).toISOString()
            if (!payload.createdBy && !payload.createdAt) return
            updateMutation.mutate(payload)
          }}
        >
          <h3>Edit Incident Metadata</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <div>
              <label>Created By (User ID)</label>
              <input value={createdByInput} onChange={(e) => setCreatedByInput(e.target.value)} placeholder="user id" />
              <div className="small-muted">Warning: changing ownership may immediately revoke your access.</div>
            </div>
            <div>
              <label>Created At</label>
              <input type="datetime-local" value={createdAtInput} onChange={(e) => setCreatedAtInput(e.target.value)} />
            </div>
            <div>
              <button className="primary" type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
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
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        if (!expires) return
        try {
          const d = new Date(expires)
          onCreate(d.toISOString())
          setExpires('')
        } catch {}
      }}
    >
      <label>Expiration (Local Time)</label>
      <input
        type="datetime-local"
        value={expires}
        onChange={(e) => setExpires(e.target.value)}
      />
      <button className="primary" type="submit">Create</button>
    </form>
  )
}
