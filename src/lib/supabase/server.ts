import { createServerClient } from '@supabase/ssr'
import type { Cookies } from '@sveltejs/kit';

export function createClient(cookies: Cookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies.getAll().map(({ name, value }) => ({ name, value }))
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookies.set(name, value, { path: '/', ...options })
            )
          } catch {
            // Can be ignored - called from server load function
          }
        },
      },
    }
  )
}
