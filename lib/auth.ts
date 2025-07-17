import { createServiceClient } from "./supabase/server"
import { cookies } from "next/headers"

export interface UserSession {
  id: number
  email: string
  first_name: string | null
  last_name: string | null
  middle_name: string | null
  user_level: string
  is_active: boolean
  force_password_change: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("auth_session")

    if (!sessionCookie?.value) {
      return null
    }

    const userId = sessionCookie.value
    const supabase = createServiceClient()

    // Get user details from our users table
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !userData) {
      return null
    }

    return userData as UserSession
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Backwards-compat – keep older imports working.
 * `getUserSession` is now an alias of `getCurrentUser`.
 */
export async function getUserSession() {
  return getCurrentUser()
}

export function getFullName(
  firstName: string | null,
  lastName: string | null,
  middleName: string | null = null,
): string {
  const parts = []

  if (firstName) parts.push(firstName)
  if (middleName) parts.push(`${middleName}.`)
  if (lastName) parts.push(lastName)

  return parts.join(" ") || "Unknown User"
}

export function getInitials(firstName: string | null, lastName: string | null): string {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : ""
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : ""

  return `${firstInitial}${lastInitial}` || "U"
}
