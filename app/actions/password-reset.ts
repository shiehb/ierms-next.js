"use server"

import { createServiceClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import { sendEmail } from "@/lib/email"

interface FormState {
  message: string
  success: boolean
  redirectTo?: string
}

export async function requestPasswordReset(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServiceClient()
  const email = formData.get("email") as string

  if (!email) {
    return {
      message: "Email is required.",
      success: false,
    }
  }

  try {
    // Check if user exists
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .limit(1)

    if (userError) {
      console.error("Database error:", userError)
      return {
        message: "An error occurred. Please try again.",
        success: false,
      }
    }

    if (!users || users.length === 0) {
      // Don't reveal if email exists or not for security
      return {
        message: "If an account with that email exists, a reset code has been sent.",
        success: true,
        redirectTo: "/verify-reset",
      }
    }

    const user = users[0]

    // Generate a 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    // Store the reset token
    const { error: tokenError } = await supabase.from("password_reset_tokens").insert({
      user_id: user.id,
      token: resetCode,
      expires_at: expiresAt.toISOString(),
      used: false,
    })

    if (tokenError) {
      console.error("Error storing reset token:", tokenError)
      return {
        message: "An error occurred. Please try again.",
        success: false,
      }
    }

    // Send the reset code via email
    const resetEmailHtml = `
      <p>Hello,</p>
      <p>You have requested a password reset for your account.</p>
      <p>Your password reset verification code is: <strong>${resetCode}</strong></p>
      <p>This code is valid for 15 minutes. If you did not request a password reset, please ignore this email.</p>
      <p>To complete your password reset, please enter this code on the verification page.</p>
      <p>Thank you,</p>
      <p>Your Application Team</p>
    `
    await sendEmail({
      to: email,
      subject: "Your Password Reset Verification Code",
      html: resetEmailHtml,
    })

    return {
      message: "A reset code has been sent to your email.",
      success: true,
      redirectTo: "/verify-reset",
    }
  } catch (error) {
    console.error("Password reset request error:", error)
    return {
      message: "An unexpected error occurred. Please try again.",
      success: false,
    }
  }
}

export async function verifyResetCode(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServiceClient()
  const email = formData.get("email") as string
  const code = formData.get("code") as string

  if (!email || !code) {
    return {
      message: "Email and verification code are required.",
      success: false,
    }
  }

  try {
    // Find user by email
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .limit(1)

    if (userError || !users || users.length === 0) {
      return {
        message: "Invalid email or verification code.",
        success: false,
      }
    }

    const user = users[0]

    // Verify the reset code
    const { data: tokens, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("user_id", user.id)
      .eq("token", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .limit(1)

    if (tokenError || !tokens || tokens.length === 0) {
      return {
        message: "Invalid or expired verification code.",
        success: false,
      }
    }

    return {
      message: "Verification code confirmed. You can now reset your password.",
      success: true,
      redirectTo: `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
    }
  } catch (error) {
    console.error("Verify reset code error:", error)
    return {
      message: "An unexpected error occurred. Please try again.",
      success: false,
    }
  }
}

export async function resetPassword(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServiceClient()
  const email = formData.get("email") as string
  const code = formData.get("code") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!email || !code || !newPassword || !confirmPassword) {
    return {
      message: "All fields are required.",
      success: false,
    }
  }

  if (newPassword !== confirmPassword) {
    return {
      message: "Passwords do not match.",
      success: false,
    }
  }

  if (newPassword.length < 8) {
    return {
      message: "Password must be at least 8 characters long.",
      success: false,
    }
  }

  try {
    // Find user by email
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .limit(1)

    if (userError || !users || users.length === 0) {
      return {
        message: "Invalid reset request.",
        success: false,
      }
    }

    const user = users[0]

    // Verify the reset code is still valid
    const { data: tokens, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("user_id", user.id)
      .eq("token", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .limit(1)

    if (tokenError || !tokens || tokens.length === 0) {
      return {
        message: "Invalid or expired reset code.",
        success: false,
      }
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user's password and remove force password change flag
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

    // Mark the reset token as used
    await supabase.from("password_reset_tokens").update({ used: true }).eq("id", tokens[0].id)

    return {
      message: "Password has been successfully reset.",
      success: true,
      redirectTo: "/login?resetSuccess=true",
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return {
      message: "An unexpected error occurred. Please try again.",
      success: false,
    }
  }
}
