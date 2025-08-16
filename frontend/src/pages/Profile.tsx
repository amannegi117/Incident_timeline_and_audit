import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { fetchMe } from '../api/users'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { token } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe(token),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error)
    return <div style={{ color: "crimson" }}>{(error as any).message}</div>;
  if (!data) return null;

  return (
    <div>
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
          <Link key={inc.id} to={`/incidents/${inc.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{inc.title}</strong>
                <div>
                  <span className="badge">{inc.severity}</span>
                  <span className="badge">{inc.status}</span>
                </div>
              </div>
              <div>{dayjs(inc.createdAt).format("YYYY-MM-DD HH:mm")}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}