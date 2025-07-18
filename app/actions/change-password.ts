"use server"

import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

export async function changePassword(prevState: any, formData: FormData) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/login")
    }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        message: "All fields are required",
        success: false,
      }
    }

    if (newPassword !== confirmPassword) {
      return {
        message: "New passwords do not match",
        success: false,
      }
    }

    if (newPassword.length < 8) {
      return {
        message: "New password must be at least 8 characters long",
        success: false,
      }
    }

    const supabase = createClient()

    // Get user's current password hash from database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      return {
        message: "Failed to verify current password",
        success: false,
      }
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password_hash)

    if (!isCurrentPasswordValid) {
      return {
        message: "Current password is incorrect",
        success: false,
      }
    }

    // Hash new password
    const saltRounds = 12
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

    // Update password in database
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      return {
        message: "Failed to update password",
        success: false,
      }
    }

    return {
      message: "Password changed successfully",
      success: true,
    }
  } catch (error) {
    console.error("Change password error:", error)
    return {
      message: "An unexpected error occurred",
      success: false,
    }
  }
}
