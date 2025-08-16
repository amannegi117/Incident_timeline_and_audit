import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "../api/stats";
import { useAuth } from "../hooks/useAuth";
import IncidentsList from "./IncidentsList";

export default function Dashboard() {
  const { token } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: () => fetchStats(token),
  });

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card-grid">
        <div
          className="card stat-card"
          style={{ backgroundColor: "#b9edc4ff" }}
        >
          <div className="stat-label">My Incidents</div>
          <div className="stat-value">
            {isLoading ? "..." : error ? "-" : data?.myIncidents ?? 0}
          </div>
        </div>
        <div
          className="card stat-card"
          style={{ backgroundColor: "#a0d8dfff" }}
        >
          <div className="stat-label">Total Users</div>
          <div className="stat-value">
            {isLoading ? "..." : error ? "-" : data?.totalUsers ?? 0}
          </div>
        </div>
      </div>

      <h3>Recent Incidents</h3>
      <IncidentsList />
    </div>
  );
}
