import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabaseEntity } from '../../lib/supabaseClient'
import type { ProjectRow } from '../../types/database'
import './admin.css'

export default function AdminProjectsList() {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error: qErr } = await supabaseEntity()
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (qErr) setError(qErr.message)
      else setProjects((data ?? []) as ProjectRow[])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <section className="pageSection adminPage">
        <p className="adminMuted">Loading projects…</p>
      </section>
    )
  }

  return (
    <section className="pageSection adminPage">
      <div className="adminToolbar">
        <h1 className="screenTitle">Projects</h1>
        <Link className="adminButton adminButtonLink" to="/admin/projects/new">
          New project
        </Link>
      </div>
      {error ? <p className="adminError">{error}</p> : null}
      {projects.length === 0 ? (
        <p className="adminMuted">No projects yet. Create one to get started.</p>
      ) : (
        <ul className="adminList">
          {projects.map((p) => (
            <li key={p.id} className="adminListItem">
              <Link to={`/admin/projects/${p.id}`} className="adminListLink">
                <span className="adminListTitle">{p.title}</span>
                <span className="adminListMeta">
                  {p.published_at ? 'Published' : 'Draft'}
                  {p.is_hidden ? ' · Hidden' : ''} · {p.slug}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="adminFooterLink">
        <Link to="/">View site</Link>
      </p>
    </section>
  )
}
