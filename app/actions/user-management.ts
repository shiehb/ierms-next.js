"use server"

import { createServiceClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import { SELECTABLE_USER_LEVELS, type UserLevel } from "@/lib/constants"
import { sendEmail } from "@/lib/email"

const supabase = createServiceClient()

export interface User {
  id: number
  first_name: string | null
  last_name: string | null
  middle_name: string | null
  email: string
  user_level: UserLevel
  is_active: boolean
  created_at: string
  updated_at: string
  force_password_change: boolean
  avatar_url: string | null
}

interface FormState {
  message: string
  success: boolean
  errors?: {
    firstName?: string[]
    lastName?: string[]
    middleName?: string[]
    email?: string[]
    userLevel?: string[]
    avatar?: string[]
  }
}

const TOKEN_EXPIRATION_MINUTES = 15

// Helper function for validation
function validateUserData(
  data: {
    firstName: string
    lastName: string
    middleName: string
    email: string
    userLevel?: string
  },
  isNewUser: boolean,
): FormState["errors"] {
  const errors: FormState["errors"] = {}

  if (!data.firstName) {
    errors.firstName = ["First name is required."]
  }
  if (!data.lastName) {
    errors.lastName = ["Last name is required."]
  }
  if (!data.middleName) {
    errors.middleName = ["Middle name is required."]
  }
  if (!data.email || !data.email.includes("@")) {
    errors.email = ["Please enter a valid email address."]
  }
  if (data.userLevel && !SELECTABLE_USER_LEVELS.includes(data.userLevel as UserLevel)) {
    errors.userLevel = ["Invalid user level selected."]
  }

  return Object.keys(errors).length > 0 ? errors : undefined
}

// Avatar upload function
export async function uploadAvatar(file: File, userId: number): Promise<FormState> {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { message: "Failed to upload avatar", success: false }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath)

    // Update user's avatar_url in database
    const { error: updateError } = await supabase.from("users").update({ avatar_url: publicUrl }).eq("id", userId)

    if (updateError) {
      console.error("Database update error:", updateError)
      return { message: "Failed to update avatar in database", success: false }
    }

    revalidatePath("/profile")
    revalidatePath("/users")

    return { message: "Avatar uploaded successfully!", success: true }
  } catch (error: any) {
    console.error("Avatar upload error:", error)
    return { message: `Failed to upload avatar: ${error.message}`, success: false }
  }
}

// Delete avatar function
export async function deleteAvatar(userId: number): Promise<FormState> {
  try {
    // Get current avatar URL
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", userId)
      .single()

    if (fetchError) {
      return { message: "Failed to fetch user data", success: false }
    }

    // Remove avatar_url from database
    const { error: updateError } = await supabase.from("users").update({ avatar_url: null }).eq("id", userId)

    if (updateError) {
      return { message: "Failed to remove avatar from database", success: false }
    }

    // Delete file from storage if it exists
    if (userData.avatar_url) {
      const filePath = userData.avatar_url.split("/").pop()
      if (filePath) {
        await supabase.storage.from("avatars").remove([`avatars/${filePath}`])
      }
    }

    revalidatePath("/profile")
    revalidatePath("/users")

    return { message: "Avatar removed successfully!", success: true }
  } catch (error: any) {
    console.error("Avatar deletion error:", error)
    return { message: `Failed to remove avatar: ${error.message}`, success: false }
  }
}

export async function getUsers(
  searchQuery?: string,
  userLevelFilter?: UserLevel,
  page = 1,
  pageSize = 10,
  sortBy = "created_at",
  sortOrder: "asc" | "desc" = "desc",
): Promise<{ users: User[]; totalCount: number; totalPages: number }> {
  let query = supabase.from("users").select("*", { count: "exact" }).neq("user_level", "admin")

  if (searchQuery) {
    query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
  }

  if (userLevelFilter && SELECTABLE_USER_LEVELS.includes(userLevelFilter)) {
    query = query.eq("user_level", userLevelFilter)
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching users:", error.message)
    return { users: [], totalCount: 0, totalPages: 0 }
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    users: data as User[],
    totalCount,
    totalPages,
  }
}

export async function createUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const middleName = (formData.get("middleName") as string) || null
  const email = formData.get("email") as string
  const userLevel = formData.get("userLevel") as UserLevel

  const validationErrors = validateUserData(
    {
      firstName,
      lastName,
      middleName: middleName || "",
      email,
      userLevel,
    },
    true,
  )
  if (validationErrors) {
    return {
      message: "Validation failed.",
      success: false,
      errors: validationErrors,
    }
  }

  const defaultPassword = process.env.DEFAULT_USER_PASSWORD
  if (!defaultPassword) {
    return { message: "Default user password not configured.", success: false }
  }

  try {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    const { data, error } = await supabase
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

    // Send welcome email to the new user
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

    revalidatePath("/users")
    return {
      message: "User created successfully! Default password assigned and welcome email sent.",
      success: true,
    }
  } catch (error: any) {
    console.error("Error creating user:", error.message)
    if (error.code === "23505") {
      return {
        message: "A user with this email already exists.",
        success: false,
      }
    }
    return {
      message: `Failed to create user: ${error.message}`,
      success: false,
    }
  }
}

export async function updateUser(prevState: FormState, formData: FormData): Promise<FormState> {
  const id = Number.parseInt(formData.get("id") as string)
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const middleName = (formData.get("middleName") as string) || null
  const email = formData.get("email") as string
  const userLevel = formData.get("userLevel") as UserLevel

  if (isNaN(id)) {
    return { message: "Invalid user ID.", success: false }
  }

  const validationErrors = validateUserData(
    {
      firstName,
      lastName,
      middleName: middleName || "",
      email,
      userLevel,
    },
    false,
  )
  if (validationErrors) {
    return {
      message: "Validation failed.",
      success: false,
      errors: validationErrors,
    }
  }

  try {
    const { data, error } = await supabase
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

    revalidatePath("/users")
    return { message: "User updated successfully!", success: true }
  } catch (error: any) {
    console.error("Error updating user:", error.message)
    if (error.code === "23505") {
      return {
        message: "A user with this email already exists.",
        success: false,
      }
    }
    return {
      message: `Failed to update user: ${error.message}`,
      success: false,
    }
  }
}

export async function resetUserPassword(userId: number): Promise<FormState> {
  if (isNaN(userId)) {
    return { message: "Invalid user ID.", success: false }
  }

  try {
    const { data: users, error: userError } = await supabase.from("users").select("email").eq("id", userId).limit(1)

    if (userError) throw userError
    if (!users || users.length === 0) {
      return { message: "User not found.", success: false }
    }
    const userEmail = users[0].email

    await supabase.from("password_reset_tokens").update({ is_used: true }).eq("user_id", userId).eq("is_used", false)

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000).toISOString()

    const { error: tokenError } = await supabase
      .from("password_reset_tokens")
      .insert([{ user_id: userId, token: token, expires_at: expiresAt }])

    if (tokenError) throw tokenError

    await sendEmail({
      to: userEmail,
      subject: "Password Reset Code",
      html: `<p>Your password reset code is: <b>${token.substring(0, 6)}</b></p><p>This code is valid for ${TOKEN_EXPIRATION_MINUTES} minutes.</p>`,
    })

    return {
      message: `Password reset code sent to ${userEmail}.`,
      success: true,
    }
  } catch (error: any) {
    console.error("Error resetting user password:", error.message)
    return {
      message: `Failed to send reset code: ${error.message}`,
      success: false,
    }
  }
}

export async function toggleUserActiveStatus(userId: number, currentStatus: boolean): Promise<FormState> {
  if (isNaN(userId)) {
    return { message: "Invalid user ID.", success: false }
  }

  try {
    const { data, error } = await supabase.from("users").update({ is_active: !currentStatus }).eq("id", userId).select()

    if (error) throw error

    revalidatePath("/users")
    return {
      message: `User account ${!currentStatus ? "activated" : "deactivated"} successfully!`,
      success: true,
    }
  } catch (error: any) {
    console.error("Error toggling user status:", error.message)
    return {
      message: `Failed to toggle user status: ${error.message}`,
      success: false,
    }
  }
}
