import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav>
      <div className="nav-inner">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/incidents">Incidents</Link>
        <div className="spacer" />
        {token ? (
          <>
            <span>{user?.email} ({user?.role})</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  )
}
