import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const hasSupabaseConfig = Boolean(url && anonKey)

if (!hasSupabaseConfig) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Admin and dynamic Architecture content will not work until set.',
  )
}

let client: SupabaseClient | undefined

function getSupabase(): SupabaseClient {
  if (!hasSupabaseConfig) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env',
    )
  }
  client ??= createClient(url, anonKey)
  return client
}

/** Lazy client — safe to import when env vars are missing (throws only on use). */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getSupabase(), prop, receiver)
    return typeof value === 'function' ? value.bind(getSupabase()) : value
  },
})

/** PostgREST: entity.projects, entity.project_contents, entity.project_texts */
export function supabaseEntity() {
  return supabase.schema('entity')
}

/** PostgREST: security.users (profile / admin flag) */
export function supabaseSecurity() {
  return supabase.schema('security')
}
