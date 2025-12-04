import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Placeholder URLs for build time - will be replaced at runtime
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder-key'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}

