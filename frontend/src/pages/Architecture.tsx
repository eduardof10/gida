import { useEffect, useState } from 'react'
import { hasSupabaseConfig, supabase, supabaseEntity } from '../lib/supabaseClient'
import type { ProjectWithContents } from '../types/database'
import './Architecture.css'

export default function Architecture() {
  const [projects, setProjects] = useState<ProjectWithContents[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(() => hasSupabaseConfig)

  useEffect(() => {
    if (!hasSupabaseConfig) {
      return
    }
    let cancelled = false
    async function load() {
      const { data, error: qErr } = await supabaseEntity()
        .from('projects')
        .select(
          `
          id,
          title,
          slug,
          summary,
          published_at,
          sort_order,
          project_contents (
            id,
            sort_order,
            storage_path,
            width_px,
            height_px,
            caption,
            project_texts ( body )
          )
        `,
        )
        .not('published_at', 'is', null)
        .order('sort_order', { ascending: true })

      if (cancelled) return
      if (qErr) {
        setError(qErr.message)
        setProjects([])
      } else {
        setProjects((data ?? []) as unknown as ProjectWithContents[])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (!hasSupabaseConfig) {
    return (
      <section className="pageSection">
        <h1 className="screenTitle">Architecture</h1>
        <p className="screenSubtitle">
          Explore our architectural work. Configure{' '}
          <code className="archCode">VITE_SUPABASE_URL</code> and{' '}
          <code className="archCode">VITE_SUPABASE_ANON_KEY</code> to load projects from the
          database.
        </p>
      </section>
    )
  }

  if (loading) {
    return (
      <section className="pageSection">
        <h1 className="screenTitle">Architecture</h1>
        <p className="screenSubtitle">Loading…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="pageSection">
        <h1 className="screenTitle">Architecture</h1>
        <p className="archError" role="alert">
          {error}
        </p>
      </section>
    )
  }

  if (projects.length === 0) {
    return (
      <section className="pageSection">
        <h1 className="screenTitle">Architecture</h1>
        <p className="screenSubtitle">
          No published projects yet. Admins can add them under{' '}
          <a href="/admin/projects">/admin/projects</a>.
        </p>
      </section>
    )
  }

  return (
    <section className="pageSection archPage">
      <h1 className="screenTitle">Architecture</h1>
      <p className="screenSubtitle">Explore our architectural work.</p>
      <div className="archProjects">
        {projects.map((project) => (
          <article key={project.id} className="archProject" id={project.slug}>
            <h2 className="archProjectTitle">{project.title}</h2>
            {project.summary ? <p className="archProjectSummary">{project.summary}</p> : null}
            <div className="archProjectMedia">
              {(project.project_contents ?? [])
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((c) => {
                  const imgUrl = supabase.storage
                    .from('project-media')
                    .getPublicUrl(c.storage_path).data.publicUrl
                  const textRow = c.project_texts
                  const longText = Array.isArray(textRow)
                    ? textRow[0]?.body
                    : textRow?.body
                  return (
                    <figure key={c.id} className="archFigure">
                      <img
                        className="archImage"
                        src={imgUrl}
                        alt={c.caption ?? project.title}
                        loading="lazy"
                        width={c.width_px ?? undefined}
                        height={c.height_px ?? undefined}
                      />
                      {c.caption ? (
                        <figcaption className="archCaption">{c.caption}</figcaption>
                      ) : null}
                      {longText ? (
                        <p className="archLongText">{longText}</p>
                      ) : null}
                    </figure>
                  )
                })}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
