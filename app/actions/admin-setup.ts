"use server"

import bcrypt from "bcryptjs"
import { createServiceClient } from "@/lib/supabase/server"

interface FormState {
  message: string
  success: boolean
  errors?: {
    email?: string[]
    password?: string[]
  }
}

export async function adminSignup(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServiceClient()

  // 1. Check if any user already exists (one-time setup enforcement)
  try {
    const { count, error: countError } = await supabase.from("users").select("*", { count: "exact", head: true })

    if (countError) throw countError

    if (count && count > 0) {
      return {
        message: "Admin setup has already been completed. This form is no longer accessible.",
        success: false,
      }
    }
  } catch (dbError: any) {
    console.error("Supabase check error:", dbError.message)
    return {
      message: `Database error during setup check: ${dbError.message}. Please try again.`,
      success: false,
    }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const errors: FormState["errors"] = {}

  // 2. Server-side Validation
  if (!email || !email.includes("@")) {
    errors.email = ["Please enter a valid email address."]
  }
  if (!password || password.length < 8) {
    errors.password = ["Password must be at least 8 characters long."]
  }

  if (Object.keys(errors).length > 0) {
    return {
      message: "Validation failed.",
      success: false,
      errors,
    }
  }

  try {
    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 4. Store Credentials in Supabase with 'admin' role
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          email: email,
          password_hash: hashedPassword,
          user_level: "admin",
          is_active: true,
        },
      ])
      .select()

    if (error) throw error

    return {
      message: "Admin account created successfully!",
      success: true,
    }
  } catch (error: any) {
    console.error("Admin signup error:", error.message)
    if (error.code === "23505") {
      return {
        message: "An account with this email already exists.",
        success: false,
      }
    }
    return {
      message: `Failed to create admin account: ${error.message}. Please try again.`,
      success: false,
    }
  }
}
