"use server"

import bcrypt from "bcryptjs"
import { createServiceClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

interface FormState {
  message: string
  success: boolean
  redirectTo?: string
}

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServiceClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      message: "Email and password are required.",
      success: false,
    }
  }

  try {
    // 1. Find user by email
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, password_hash, is_active, force_password_change")
      .eq("email", email)
      .limit(1)

    if (error) {
      console.error("Database error during login:", error)
      return {
        message: "An error occurred while processing your request.",
        success: false,
      }
    }

    if (!users || users.length === 0) {
      return {
        message: "Invalid credentials.",
        success: false,
      }
    }

    const user = users[0]

    // Check if user is active
    if (!user.is_active) {
      return {
        message: "Your account is deactivated. Please contact admin support.",
        success: false,
      }
    }

    // 2. Compare provided password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return {
        message: "Invalid credentials.",
        success: false,
      }
    }

    // 3. Successful authentication - Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("auth_session", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
      sameSite: "lax",
    })

    console.log(`User ${user.email} logged in successfully.`)

    // 4. Return success with redirect information instead of calling redirect()
    if (user.force_password_change) {
      return {
        message: "Login successful. You must change your password.",
        success: true,
        redirectTo: "/force-password-change",
      }
    } else {
      return {
        message: "Login successful.",
        success: true,
        redirectTo: "/dashboard",
      }
    }
  } catch (error: any) {
    console.error("Login error:", error)
    return {
      message: "An unexpected error occurred. Please try again.",
      success: false,
    }
  }
}

export async function logout(): Promise<{ success: boolean; redirectTo?: string }> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth_session")

    return {
      success: true,
      redirectTo: "/login",
    }
  } catch (error) {
    console.error("Logout error:", error)
    return {
      success: false,
    }
  }
}
