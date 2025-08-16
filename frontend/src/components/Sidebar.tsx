import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Sidebar() {
  const { token } = useAuth()
  if (!token) return null
  return (
    <aside style={{ width: 240, padding: 12 }}>
      <div className="card" style={{ position: 'sticky', top: 12 }}>
        <nav style={{ display: 'grid', gap: 8 }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/about">About</Link>
          <Link to="/incidents#new">New Incident</Link>
        </nav>
      </div>
    </aside>
  )
}