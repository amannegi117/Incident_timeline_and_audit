import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createIncident, fetchIncidents, Incident, deleteIncident as deleteIncidentApi } from '../api/incidents'
import { useAuth } from '../hooks/useAuth'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import {useToast} from '../components/Toast'

export default function IncidentsList() {
  const { token, user } = useAuth()
  const qc = useQueryClient()
  const {show, node} = useToast()

  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [tag, setTag] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['incidents', { search, severity, dateFrom, dateTo, tag }],
    queryFn: () =>
      fetchIncidents(
        {
          search,
          severity: severity || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          tags: tag ? [tag] : undefined,
          page: 1,
          limit: 20,
        },
        token
      ),
  })

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; severity: Incident['severity']; tags: string[] }) =>
    createIncident(payload, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] })
      show('Incident created')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIncidentApi(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] })
      show('Incident deleted')
    }
  })

  return (
    <div>
      {node}
      <h2>Incidents</h2>

      <div className="filters card">
        <div>
          <label>Search</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Title, tag, timeline..." />
        </div>
        <div>
          <label>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">All</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>
        </div>
        <div>
          <label>Tag</label>
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="tag" />
        </div>
        <div>
          <label>Date From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label>Date To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {user?.role && (
        <CreateIncident onCreate={(payload) => createMutation.mutate(payload)} loading={createMutation.isPending} />
      )}

      {isLoading && <div>Loading...</div>}
      {error && <div style={{ color: 'crimson' }}>{(error as any).message}</div>}

      <div className="list">
        {data?.data.map((inc) => (
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>{dayjs(inc.createdAt).format('YYYY-MM-DD HH:mm')}</div>
                {user?.role === 'ADMIN' && (
                  <button className="primary" onClick={() => {
                    if (confirm('Delete this incident?')) deleteMutation.mutate(inc.id)
                  }}>Delete</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CreateIncident({ onCreate, loading }: { onCreate: (p: { title: string; severity: Incident['severity']; tags: string[] }) => void; loading: boolean }) {
  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState<Incident['severity']>('P3')
  const [tags, setTags] = useState('')

  return (
    <form
      id="new"
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        onCreate({ title, severity, tags: tags.split(',').map((s) => s.trim()).filter(Boolean) })
        setTitle('')
        setTags('')
      }}
    >
      <h3>Create Incident</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <div>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value as Incident['severity'])}>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>
        </div>
        <div>
          <label>Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., api,urgent" />
        </div>
        <button className="primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
      </div>
    </form>
  )
}


