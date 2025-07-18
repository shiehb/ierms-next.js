import { createClient } from "@/lib/supabase/client"

export interface AvatarState {
  src: string | null
  isLoading: boolean
  hasError: boolean
}

export async function getUserAvatarUrl(userId: string, avatarUrl: string | null): Promise<string | null> {
  if (!avatarUrl) return null

  try {
    const supabase = createClient()

    // If it's already a full URL, return it
    if (avatarUrl.startsWith("http")) {
      return avatarUrl
    }

    // If it's a storage path, get the public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(avatarUrl)

    return data.publicUrl
  } catch (error) {
    console.error("Error getting avatar URL:", error)
    return null
  }
}

export function getUserInitials(firstName?: string | null, lastName?: string | null, email?: string): string {
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  if (initials) return initials

  // Fallback to first letter of email if no name
  return email?.[0]?.toUpperCase() || "U"
}

export function validateAvatarUrl(url: string | null): boolean {
  if (!url) return false

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
