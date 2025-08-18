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
import Layout from "./components/Layout";

export default function App() {
  return (
    <div>
      <Layout>
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

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
              path="/incidents/:id"
              element={
                <ProtectedRoute>
                  <IncidentDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/share/:token" element={<PublicShare />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Layout>
    </div>
  );
}


