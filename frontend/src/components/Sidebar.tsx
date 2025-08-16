import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Sidebar() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => navigate("/")}>
        Incident Hub
      </div>
      <nav className="sidebar-nav">
        <Link
          className={isActive("/dashboard") ? "active" : ""}
          to="/dashboard"
        >
          <span className="icon">🏠</span>
          <span>Dashboard</span>
        </Link>
        <Link
          className={isActive("/incidents") ? "active" : ""}
          to="/incidents"
        >
          <span className="icon">📋</span>
          <span>Incidents</span>
        </Link>

        <Link className={isActive("/about") ? "active" : ""} to="/about">
          <span className="icon">ℹ️</span>
          <span>About</span>
        </Link>
      </nav>
    </aside>
  );
}
