import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { fetchMe } from '../api/users'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import { deleteIncident as deleteIncidentApi } from '../api/incidents'
import { useToast } from '../components/Toast'

export default function Profile() {
  const { token, user } = useAuth();
  const qc = useQueryClient();
  const { show, node } = useToast();
  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe(token),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return <div style={{ color: "crimson" }}>{(error as any).message}</div>;
  if (!data) return null;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteIncidentApi(id, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incidents'] });
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      show('Incident deleted');
    },
  });

  return (
    <div>
      {node}
      <h2>My Profile</h2>
      <div className="card" style={{ display: "grid", gap: 8 }}>
        <div>
          <strong>Email:</strong> {data.email}
        </div>
        <div>
          <strong>Role:</strong> {data.role}
        </div>
        <div>
          <strong>Joined:</strong>{" "}
          {dayjs(data.createdAt).format("YYYY-MM-DD HH:mm")}
        </div>
        <div className="card-grid">
          <div className="card stat-card">
            <div className="stat-label">Incidents</div>
            <div className="stat-value">{data._count.createdIncidents}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Timeline Items</div>
            <div className="stat-value">{data._count.timelineEvents}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Reviews</div>
            <div className="stat-value">{data._count.reviews}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-label">Share Links</div>
            <div className="stat-value">{data._count.shareLinks}</div>
          </div>
        </div>
      </div>
      <h3>Recently Created Incidents</h3>
      <div className="list">
        {data.createdIncidents.map((inc: any) => (
          <div key={inc.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Link to={`/incidents/${inc.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <strong>{inc.title}</strong>
                </Link>
                <div>
                  <span className="badge">{inc.severity}</span>
                  <span className="badge">{inc.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div>{dayjs(inc.createdAt).format("YYYY-MM-DD HH:mm")}</div>
                {user?.role === 'ADMIN' && (
                  <button
                    className="icon-button"
                    aria-label="Delete incident"
                    title="Delete incident"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm('Delete this incident?')) deleteMutation.mutate(inc.id);
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}