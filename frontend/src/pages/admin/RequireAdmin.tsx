import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <section className="pageSection adminPage">
        <p className="adminMuted">Loading…</p>
      </section>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  if (!profile?.is_admin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
