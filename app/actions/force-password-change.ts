"use server"

import bcrypt from "bcryptjs"
import { createServiceClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

interface FormState {
  message: string
  success: boolean
  redirectTo?: string
}

export async function forcePasswordChange(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServiceClient()

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return {
      message: "All fields are required.",
      success: false,
    }
  }

  if (newPassword !== confirmPassword) {
    return {
      message: "New passwords do not match.",
      success: false,
    }
  }

  if (newPassword.length < 8) {
    return {
      message: "Password must be at least 8 characters long.",
      success: false,
    }
  }

  if (currentPassword === newPassword) {
    return {
      message: "New password must be different from current password.",
      success: false,
    }
  }

  try {
    // Get current user from session
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("auth_session")

    if (!sessionCookie?.value) {
      return {
        message: "Session expired. Please log in again.",
        success: false,
        redirectTo: "/login",
      }
    }

    const userId = sessionCookie.value

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, password_hash")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return {
        message: "User not found. Please log in again.",
        success: false,
        redirectTo: "/login",
      }
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash)

    if (!passwordMatch) {
      return {
        message: "Current password is incorrect.",
        success: false,
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password and remove force change flag
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: hashedPassword,
        force_password_change: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating password:", updateError)
      return {
        message: "Failed to update password. Please try again.",
        success: false,
      }
    }

    console.log(`User ${user.email} successfully changed password.`)

    return {
      message: "Password changed successfully.",
      success: true,
      redirectTo: "/dashboard",
    }
  } catch (error) {
    console.error("Force password change error:", error)
    return {
      message: "An unexpected error occurred. Please try again.",
      success: false,
    }
  }
}
