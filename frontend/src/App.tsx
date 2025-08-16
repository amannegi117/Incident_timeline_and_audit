import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import IncidentsList from './pages/IncidentsList'
import IncidentDetail from './pages/IncidentDetail'
import PublicShare from './pages/PublicShare'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import About from './pages/About'

export default function App() {
  return (
    <div>
      <Navbar />
      <div className="container" style={{ display: 'flex', gap: 12 }}>
        <Sidebar />
        <div style={{ flex: 1 }}>
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <About />
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
              path="/incidents/:id"
              element={
                <ProtectedRoute>
                  <IncidentDetail />
                </ProtectedRoute>
              }
            />

            <Route path="/share/:token" element={<PublicShare />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}


