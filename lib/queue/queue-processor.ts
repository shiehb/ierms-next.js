import type { QueueAction } from "./types"
import { createServiceClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import { sendEmail } from "@/lib/email"
import crypto from "crypto"

export class QueueProcessor {
  private supabase = createServiceClient()

  async processAction(action: QueueAction): Promise<void> {
    switch (action.actionType) {
      case "CREATE_USER":
        await this.processCreateUser(action)
        break
      case "UPDATE_USER":
        await this.processUpdateUser(action)
        break
      case "RESET_PASSWORD":
        await this.processResetPassword(action)
        break
      case "UPLOAD_AVATAR":
        await this.processUploadAvatar(action)
        break
      case "DELETE_AVATAR":
        await this.processDeleteAvatar(action)
        break
      default:
        throw new Error(`Unknown action type: ${action.actionType}`)
    }
  }

  private async processCreateUser(action: QueueAction): Promise<void> {
    const { firstName, lastName, middleName, email, userLevel } = action.data

    const defaultPassword = process.env.DEFAULT_USER_PASSWORD
    if (!defaultPassword) {
      throw new Error("Default user password not configured")
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    const { data, error } = await this.supabase
      .from("users")
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
          email: email,
          user_level: userLevel,
          password_hash: hashedPassword,
          is_active: true,
          force_password_change: true,
          avatar_url: null,
        },
      ])
      .select()

    if (error) throw error

    // Send welcome email
    const welcomeEmailHtml = `
      <p>Hello ${firstName},</p>
      <p>Welcome to our application! Your account has been successfully created.</p>
      <p>Here are your account details:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Temporary Password:</strong> ${defaultPassword}</li>
      </ul>
      <p>For security reasons, we recommend you reset your password immediately after your first login.</p>
      <p>You can reset your password by visiting the <a href="${process.env.NEXT_PUBLIC_APP_URL}/forgot-password">Forgot Password page</a> and entering your email address.</p>
      <p>Thank you!</p>
    `

    await sendEmail({
      to: email,
      subject: "Welcome to Our Application! Your Account Details",
      html: welcomeEmailHtml,
    })
  }

  private async processUpdateUser(action: QueueAction): Promise<void> {
    const { id, firstName, lastName, middleName, email, userLevel } = action.data

    const { data, error } = await this.supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        email: email,
        user_level: userLevel,
      })
      .eq("id", id)
      .select()

    if (error) throw error
  }

  private async processResetPassword(action: QueueAction): Promise<void> {
    const { userId, userEmail } = action.data

    // Invalidate existing tokens
    await this.supabase
      .from("password_reset_tokens")
      .update({ is_used: true })
      .eq("user_id", userId)
      .eq("is_used", false)

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes

    const { error: tokenError } = await this.supabase
      .from("password_reset_tokens")
      .insert([{ user_id: userId, token: token, expires_at: expiresAt }])

    if (tokenError) throw tokenError

    await sendEmail({
      to: userEmail,
      subject: "Password Reset Code",
      html: `<p>Your password reset code is: <b>${token.substring(0, 6)}</b></p><p>This code is valid for 15 minutes.</p>`,
    })
  }

  private async processUploadAvatar(action: QueueAction): Promise<void> {
    const { userId, file, fileName } = action.data

    const filePath = `avatars/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const {
      data: { publicUrl },
    } = this.supabase.storage.from("avatars").getPublicUrl(filePath)

    // Update user's avatar_url in database
    const { error: updateError } = await this.supabase.from("users").update({ avatar_url: publicUrl }).eq("id", userId)

    if (updateError) throw updateError
  }

  private async processDeleteAvatar(action: QueueAction): Promise<void> {
    const { userId } = action.data

    // Get current avatar URL
    const { data: userData, error: fetchError } = await this.supabase
      .from("users")
      .select("avatar_url")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

    // Remove avatar_url from database
    const { error: updateError } = await this.supabase.from("users").update({ avatar_url: null }).eq("id", userId)

    if (updateError) throw updateError

    // Delete file from storage if it exists
    if (userData.avatar_url) {
      const filePath = userData.avatar_url.split("/").pop()
      if (filePath) {
        await this.supabase.storage.from("avatars").remove([`avatars/${filePath}`])
      }
    }
  }
}
