import { Navigate, useLocation } from '../router'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <main className="page-center"><div className="loader" /></main>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  if (admin && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return children
}
