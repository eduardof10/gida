import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase, supabaseEntity } from '../../lib/supabaseClient'
import type {
  ProjectContentRow,
  ProjectRow,
  ProjectTextRow,
} from '../../types/database'
import './admin.css'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

type ContentWithText = ProjectContentRow & {
  project_texts: ProjectTextRow | ProjectTextRow[] | null
}

function normalizeText(row: ContentWithText): string {
  const pt = row.project_texts
  if (!pt) return ''
  const t = Array.isArray(pt) ? pt[0] : pt
  return t?.body ?? ''
}

function normalizeTextHidden(row: ContentWithText): boolean {
  const pt = row.project_texts
  if (!pt) return false
  const t = Array.isArray(pt) ? pt[0] : pt
  return t?.is_hidden ?? false
}

export default function AdminProjectEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [published, setPublished] = useState(false)
  const [projectHidden, setProjectHidden] = useState(false)
  const [contents, setContents] = useState<ContentWithText[]>([])
  const [loading, setLoading] = useState(() => !isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [textDrafts, setTextDrafts] = useState<Record<string, string>>({})
  const [textHiddenDrafts, setTextHiddenDrafts] = useState<Record<string, boolean>>({})

  const projectId = isNew ? null : id!

  const loadContents = useCallback(async (pid: string) => {
    const { data, error: qErr } = await supabaseEntity()
      .from('project_contents')
      .select('*, project_texts(*)')
      .eq('project_id', pid)
      .order('sort_order', { ascending: true })
    if (qErr) {
      setError(qErr.message)
      return
    }
    const rows = (data ?? []) as ContentWithText[]
    setContents(rows)
    const drafts: Record<string, string> = {}
    const hiddenDrafts: Record<string, boolean> = {}
    for (const r of rows) {
      drafts[r.id] = normalizeText(r)
      hiddenDrafts[r.id] = normalizeTextHidden(r)
    }
    setTextDrafts(drafts)
    setTextHiddenDrafts(hiddenDrafts)
  }, [])

  useEffect(() => {
    if (isNew || !id) {
      return
    }
    const projectIdParam = id
    let cancelled = false
    async function load() {
      const { data, error: qErr } = await supabaseEntity()
        .from('projects')
        .select('*')
        .eq('id', projectIdParam)
        .single()
      if (cancelled) return
      if (qErr) {
        setError(qErr.message)
        setLoading(false)
        return
      }
      const p = data as ProjectRow
      setTitle(p.title)
      setSlug(p.slug)
      setSummary(p.summary ?? '')
      setPublished(!!p.published_at)
      setProjectHidden(!!p.is_hidden)
      await loadContents(projectIdParam)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, isNew, loadContents])

  async function saveProject(e?: FormEvent) {
    e?.preventDefault()
    setError(null)
    setSaving(true)
    const slugVal = slug.trim() || slugify(title)
    const payload = {
      title: title.trim(),
      slug: slugVal,
      summary: summary.trim() || null,
      published_at: published ? new Date().toISOString() : null,
      is_hidden: projectHidden,
    }

    if (isNew) {
      const { data, error: insErr } = await supabaseEntity()
        .from('projects')
        .insert(payload)
        .select('id')
        .single()
      setSaving(false)
      if (insErr) {
        setError(insErr.message)
        return
      }
      navigate(`/admin/projects/${data.id}`, { replace: true })
      return
    }

    const { error: upErr } = await supabaseEntity()
      .from('projects')
      .update(payload)
      .eq('id', projectId)
    setSaving(false)
    if (upErr) setError(upErr.message)
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !projectId) return

    setError(null)
    const path = `${projectId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error: upErr } = await supabase.storage.from('project-media').upload(path, file, {
      upsert: false,
    })
    if (upErr) {
      setError(upErr.message)
      return
    }

    const nextOrder =
      contents.length > 0 ? Math.max(...contents.map((c) => c.sort_order)) + 1 : 0

    const { data: row, error: insErr } = await supabaseEntity()
      .from('project_contents')
      .insert({
        project_id: projectId,
        sort_order: nextOrder,
        storage_path: path,
      })
      .select('*, project_texts(*)')
      .single()

    if (insErr) {
      setError(insErr.message)
      return
    }
    setContents((prev) => [...prev, row as ContentWithText])
  }

  async function removeContent(c: ContentWithText) {
    if (!projectId) return
    setError(null)
    await supabase.storage.from('project-media').remove([c.storage_path])
    const { error: delErr } = await supabaseEntity().from('project_contents').delete().eq('id', c.id)
    if (delErr) {
      setError(delErr.message)
      return
    }
    setContents((prev) => prev.filter((x) => x.id !== c.id))
    setTextDrafts((d) => {
      const n = { ...d }
      delete n[c.id]
      return n
    })
    setTextHiddenDrafts((d) => {
      const n = { ...d }
      delete n[c.id]
      return n
    })
  }

  async function setContentHidden(contentId: string, value: boolean) {
    setError(null)
    const { error: upErr } = await supabaseEntity()
      .from('project_contents')
      .update({ is_hidden: value })
      .eq('id', contentId)
    if (upErr) {
      setError(upErr.message)
      return
    }
    setContents((prev) =>
      prev.map((row) => (row.id === contentId ? { ...row, is_hidden: value } : row)),
    )
  }

  async function saveTextForContent(contentId: string) {
    const body = (textDrafts[contentId] ?? '').trim()
    if (body) {
      const { error: upErr } = await supabaseEntity().from('project_texts').upsert(
        {
          project_content_id: contentId,
          body,
          is_hidden: textHiddenDrafts[contentId] ?? false,
        },
        { onConflict: 'project_content_id' },
      )
      if (upErr) setError(upErr.message)
    } else {
      await supabaseEntity().from('project_texts').delete().eq('project_content_id', contentId)
    }
    await loadContents(projectId!)
  }

  if (loading) {
    return (
      <section className="pageSection adminPage">
        <p className="adminMuted">Loading…</p>
      </section>
    )
  }

  return (
    <section className="pageSection adminPage">
      <div className="adminToolbar">
        <h1 className="screenTitle">{isNew ? 'New project' : 'Edit project'}</h1>
        <Link className="adminButton adminButtonSecondary" to="/admin/projects">
          All projects
        </Link>
      </div>

      <form className="adminForm" onSubmit={saveProject}>
        <label className="adminLabel">
          Title
          <input
            className="adminInput"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="adminLabel">
          Slug (URL)
          <input
            className="adminInput"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto from title if empty"
          />
        </label>
        <label className="adminLabel">
          Summary
          <textarea
            className="adminTextarea"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
          />
        </label>
        <label className="adminLabel adminLabelInline">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />{' '}
          Published
        </label>
        <label className="adminLabel adminLabelInline">
          <input
            type="checkbox"
            checked={projectHidden}
            onChange={(e) => setProjectHidden(e.target.checked)}
          />{' '}
          Hidden on public site
        </label>
        {error ? <p className="adminError">{error}</p> : null}
        <button className="adminButton" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save project'}
        </button>
      </form>

      {!isNew && projectId ? (
        <div className="adminSection">
          <h2 className="adminHeading">Images</h2>
          <p className="adminMuted">
            Upload images; add optional longer text per image below.
          </p>
          <label className="adminLabel">
            Upload file
            <input type="file" accept="image/*" onChange={onUpload} />
          </label>

          <ul className="adminMediaList">
            {contents.map((c) => {
              const url = supabase.storage
                .from('project-media')
                .getPublicUrl(c.storage_path).data.publicUrl
              return (
                <li key={c.id} className="adminMediaItem">
                  <img className="adminMediaThumb" src={url} alt="" />
                  <div className="adminMediaBody">
                    <code className="adminCode">{c.storage_path}</code>
                    <label className="adminLabel adminLabelInline">
                      <input
                        type="checkbox"
                        checked={!!c.is_hidden}
                        onChange={(e) => setContentHidden(c.id, e.target.checked)}
                      />{' '}
                      Hide image on public site
                    </label>
                    <label className="adminLabel">
                      Description (optional)
                      <textarea
                        className="adminTextarea adminTextareaSm"
                        value={textDrafts[c.id] ?? ''}
                        onChange={(e) =>
                          setTextDrafts((d) => ({ ...d, [c.id]: e.target.value }))
                        }
                        rows={3}
                      />
                    </label>
                    <label className="adminLabel adminLabelInline">
                      <input
                        type="checkbox"
                        checked={textHiddenDrafts[c.id] ?? false}
                        onChange={(e) =>
                          setTextHiddenDrafts((d) => ({ ...d, [c.id]: e.target.checked }))
                        }
                      />{' '}
                      Hide description text on public site
                    </label>
                    <div className="adminMediaActions">
                      <button
                        type="button"
                        className="adminButton adminButtonSmall"
                        onClick={() => saveTextForContent(c.id)}
                      >
                        Save text
                      </button>
                      <button
                        type="button"
                        className="adminButton adminButtonDanger adminButtonSmall"
                        onClick={() => removeContent(c)}
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <p className="adminMuted adminSection">
          Save the project first, then you can upload images.
        </p>
      )}

      <p className="adminFooterLink">
        <Link to="/">View site</Link>
      </p>
    </section>
  )
}
