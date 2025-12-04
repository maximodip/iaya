import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Admin client for server-side operations that require elevated privileges
// Only use this for operations like creating users
export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

