import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './admin.css'

export default function AdminLogin() {
  const { session, profile, signIn, signOut, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session && profile?.is_admin) {
    return <Navigate to="/admin/projects" replace />
  }

  if (!loading && session && profile && !profile.is_admin) {
    return (
      <section className="pageSection adminPage">
        <h1 className="screenTitle">No admin access</h1>
        <p className="screenSubtitle adminMuted">
          This account is not marked as an admin. Ask a project owner to run in Supabase SQL, e.g.{' '}
          <code className="adminCode">
            {`UPDATE security.users SET is_admin = true WHERE id = 'your-user-uuid';`}
          </code>
        </p>
        <button className="adminButton" type="button" onClick={() => signOut()}>
          Sign out
        </button>
        <p className="adminFooterLink">
          <Link to="/">Back to site</Link>
        </p>
      </section>
    )
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await signIn(email, password)
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
  }

  return (
    <section className="pageSection adminPage">
      <h1 className="screenTitle">Admin sign in</h1>
      <p className="screenSubtitle adminMuted">
        Sign in with an account that has admin access.
      </p>
      <form className="adminForm" onSubmit={onSubmit}>
        <label className="adminLabel">
          Email
          <input
            className="adminInput"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="adminLabel">
          Password
          <input
            className="adminInput"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error ? <p className="adminError">{error}</p> : null}
        <button className="adminButton" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="adminFooterLink">
        <Link to="/">Back to site</Link>
      </p>
    </section>
  )
}
