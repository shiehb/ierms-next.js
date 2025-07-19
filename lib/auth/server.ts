import { createServiceClient } from "../supabase/server";
import { cookies } from "next/headers";
import type { Database } from "../supabase/types";

export interface UserSession {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  user_level: string;
  is_active: boolean;
  force_password_change: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("auth_session");

    if (!sessionCookie?.value) {
      return null;
    }

    const supabase = createServiceClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", sessionCookie.value)
      .single();

    if (userError || !userData) {
      return null;
    }

    return userData as UserSession;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getUserSession() {
  return getCurrentUser();
}
