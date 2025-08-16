import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createIncident, Incident } from '../api/incidents'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast'

export default function NewIncident() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { show, node } = useToast()

  const [title, setTitle] = useState('')
  const [severity, setSeverity] = useState<Incident['severity']>('P3')
  const [tags, setTags] = useState('')

  const createMutation = useMutation({
    mutationFn: () => createIncident({ title, severity, tags: tags.split(',').map((s) => s.trim()).filter(Boolean) }, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] })
      show('Incident created')
      navigate('/incidents')
    },
  })

  return (
    <div>
      {node}
      <h2>New Incident</h2>
      <form className="card" onSubmit={(e) => { e.preventDefault(); createMutation.mutate() }}>
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
          <button className="primary" type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create'}</button>
        </div>
      </form>
    </div>
  )
}