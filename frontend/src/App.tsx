import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import IncidentsList from './pages/IncidentsList'
import IncidentDetail from './pages/IncidentDetail'
import PublicShare from './pages/PublicShare'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={<Navigate to="/incidents" replace />}
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

          <Route path="*" element={<Navigate to="/incidents" replace />} />
        </Routes>
      </div>
    </div>
  )
}


