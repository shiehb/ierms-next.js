import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./types"

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  // Return existing client if it already exists (singleton pattern)
  if (client) {
    return client
  }

  // Create new client only if one doesn't exist
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  return client
}

// Export a default instance for convenience
export const supabase = createClient()
