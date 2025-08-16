import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import IncidentsList from './pages/IncidentsList'
import IncidentDetail from './pages/IncidentDetail'
import PublicShare from './pages/PublicShare'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import NewIncident from './pages/NewIncident'
import About from './pages/About'

export default function App() {
  return (
    <Layout>
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <IncidentsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents/new"
            element={
              <ProtectedRoute>
                <NewIncident />
              </ProtectedRoute>
            }
          />

          <Route
            path="/incidents/:id"
            element={
              <ProtectedRoute>
                <IncidentDetail />
              </ProtectedRoute>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/share/:token" element={<PublicShare />} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Layout>
  )
}


